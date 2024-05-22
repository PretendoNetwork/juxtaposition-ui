import { AccountDefinition } from '@pretendonetwork/grpc/account/account_service';
import { APIDefinition } from '@pretendonetwork/grpc/api/api_service';
import { LoginResponse as ApiLoginResponse } from '@pretendonetwork/grpc/api/login_rpc';
import { FriendRequest } from '@pretendonetwork/grpc/friends/friend_request';
import { FriendsDefinition } from '@pretendonetwork/grpc/friends/friends_service';
import aws from 'aws-sdk';
import bmp from 'bmp-js';
import crc32 from 'crc/crc32';
import crypto from 'crypto';
import HashMap from 'hashmap';
import grpc from 'nice-grpc';
import pako from 'pako';
import { PNG } from 'pngjs';
import sharp from 'sharp';
import TGA from 'tga';
import config from '../config.json';
import database from './database';
import logger from './logger';
import { COMMUNITY } from './models/communities';
import { CONTENT } from './models/content';
import { NOTIFICATION } from './models/notifications';
import { SETTINGS } from './models/settings';
import translations from './translations';
import { ParamPack } from './types/common/param-pack';
import { Token } from './types/common/token';
import { User } from './types/common/user';
import { INotification } from './types/mongoose/notifications';

const communityMap = new HashMap<string, string>();
const userMap = new HashMap<number, string>();

const { ip: friendsIP, port: friendsPort, api_key: friendsKey } = config.grpc.friends;
const friendsChannel = grpc.createChannel(`${friendsIP}:${friendsPort}`);
const friendsClient = grpc.createClient(FriendsDefinition, friendsChannel);

const { ip: apiIP, port: apiPort, api_key: apiKey } = config.grpc.account;
const apiChannel = grpc.createChannel(`${apiIP}:${apiPort}`);
const apiClient = grpc.createClient(APIDefinition, apiChannel);

const accountChannel = grpc.createChannel(`${apiIP}:${apiPort}`);
const accountClient = grpc.createClient(AccountDefinition, accountChannel);

const spacesEndpoint = new aws.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new aws.S3({
	endpoint: spacesEndpoint,
	accessKeyId: config.aws.spaces.key,
	secretAccessKey: config.aws.spaces.secret
});

nameCache();

function nameCache(): void {
	database.connect().then(async _ => {
		const communities = await COMMUNITY.find();
		if (communities !== null) {
			for (let i = 0; i < communities.length; i++ ) {
				if (communities[i].title_id !== null) {
					for (let j = 0; j < communities[i].title_id.length; j++) {
						communityMap.set(communities[i].title_id[j], communities[i].name);
						communityMap.set(communities[i].title_id[j] + '-id', communities[i].olive_community_id);
					}
					communityMap.set(communities[i].olive_community_id, communities[i].name);
				}
			}
			logger.success('Created community index of ' + communities.length + ' communities');
		}
		const users = await database.getUsersSettings(-1);
		if (users !== null) {
			for (let i = 0; i < users.length; i++ ) {
				if (users[i].pid !== null) {
					userMap.set(users[i].pid, users[i].screen_name.replace(/[\u{0080}-\u{FFFF}]/gu,'').replace(/\u202e/g, ''));
				}
			}
			logger.success('Created user index of ' + users.length + ' users');
		}

	}).catch(error => {
		logger.error(error);
	});
}

// TODO - This doesn't belong here, just hacking it in. Gonna redo this whole server anyway so fuck it
const INVALID_POST_BODY_REGEX = /[^\p{L}\p{P}\d\n\r$^¨←→↑↓√¦⇒⇔¤¢€£¥™©®+×÷=±∞˘˙¸˛˜°¹²³♭♪¬¯¼½¾♡♥●◆■▲▼☆★♀♂<> ]/gu;
async function create_user(pid: number, experience: number, notifications: boolean): Promise<void> {
	const pnid = await getUserDataFromPid(pid);
	if (!pnid) {
		return;
	}
	const newSettings = {
		pid: pid,
		screen_name: pnid.mii?.name,
		game_skill: experience,
		receive_notifications: notifications,
	};
	const newContent = {
		pid: pid
	};
	const newSettingsObj = new SETTINGS(newSettings);
	await newSettingsObj.save();

	const newContentObj = new CONTENT(newContent);
	await newContentObj.save();

	setName(pid, pnid.mii?.name);
}

export function decodeParamPack(paramPack: string): ParamPack {
	const values = Buffer.from(paramPack, 'base64').toString().split('\\');
	const entries = values.filter(value => value).reduce((entries: string[][], value: string, index: number) => {
		if (0 === index % 2) {
			entries.push([value]);
		} else {
			entries[Math.ceil(index / 2 - 1)].push(value);
		}

		return entries;
	}, []);

	return Object.fromEntries(entries);
}

function processServiceToken(encryptedToken: string | undefined): number | null {
	if (!encryptedToken) {
		return null;
	}
	try {
		const B64token = Buffer.from(encryptedToken, 'base64');
		const decryptedToken = decryptToken(B64token);
		const token = unpackToken(decryptedToken);

		// * Only allow token types 1 (Wii U) and 2 (3DS)
		if (token.system_type !== 1 && token.system_type !== 2) {
			return null;
		}

		return token.pid;
	} catch (e) {
		console.log(e);
		return null;
	}

}

function decryptToken(token: Buffer): Buffer {
	if (!config.aes_key) {
		throw new Error('Service token AES key not found. Set config.aes_key');
	}

	const iv = Buffer.alloc(16);
	const key = Buffer.from(config.aes_key, 'hex');

	const expectedChecksum = token.readUint32BE();
	const encryptedBody = token.subarray(4);

	const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

	const decrypted = Buffer.concat([
		decipher.update(encryptedBody),
		decipher.final()
	]);

	if (expectedChecksum !== crc32(decrypted)) {
		throw new Error('Checksum did not match. Failed decrypt. Are you using the right key?');
	}

	return decrypted;
}

function unpackToken(token: Buffer): Token {
	return {
		system_type: token.readUInt8(0x0),
		token_type: token.readUInt8(0x1),
		pid: token.readUInt32LE(0x2),
		expire_time: token.readBigUInt64LE(0x6),
		title_id: token.readBigUInt64LE(0xE),
		access_level: token.readInt8(0x16)
	};
}

function processPainting(painting: string | null, isTGA: boolean): string | null {

	if (painting === null) {
		return null;
	}

	if (isTGA) {
		const paintingBuffer = Buffer.from(painting, 'base64');
		let output: Uint8Array;
		try {
			output = pako.inflate(paintingBuffer);
		} catch (err) {
			console.error(err);
			return null;
		}
		let tga;
		try {
			tga = new TGA(Buffer.from(output));
		} catch (e) {
			console.log(e);
			return null;
		}
		const png = new PNG({
			width: tga.width,
			height: tga.height
		});
		png.data = Buffer.from(tga.pixels);
		return PNG.sync.write(png).toString('base64');
		//return `data:image/png;base64,${pngBuffer.toString('base64')}`;
	} else {
		const paintingBuffer = Buffer.from(painting, 'base64');
		const bitmap = bmp.decode(paintingBuffer);
		const tga = createBMPTgaBuffer(bitmap.width, bitmap.height, bitmap.data, false);

		let output: Uint8Array;
		try {
			output = pako.deflate(tga, {level: 6});
			return Buffer.from(output).toString('base64');
		} catch (err) {
			console.error(err);
		}

		return null;
	}
}

function nintendoPasswordHash(password: string, pid: number): string {
	const pidBuffer = Buffer.alloc(4);
	pidBuffer.writeUInt32LE(pid);

	const unpacked = Buffer.concat([
		pidBuffer,
		Buffer.from('\x02\x65\x43\x46'),
		Buffer.from(password)
	]);
	return crypto.createHash('sha256').update(unpacked).digest().toString('hex');
}

function getCommunityHash(): HashMap<string, string> {
	return communityMap;
}

function getUserHash(): HashMap<number, string> {
	return userMap;
}

function refreshCache(): void {
	nameCache();
}

function setName(pid: number, name: string | undefined): void {
	if (!pid || !name) {
		return;
	}
	userMap.delete(pid);
	userMap.set(pid, name.replace(/[\u{0080}-\u{FFFF}]/gu,'').replace(/\u202e/g, ''));
}

// TODO is this used?
async function resizeImage(file: sharp.SharpOptions, width: number, height: number): Promise<Buffer> {
	return sharp(file)
		.resize({ height: height, width: width })
		.toBuffer();
}

function createBMPTgaBuffer(width: number, height: number, pixels: Buffer, dontFlipY: boolean): Buffer {
	const buffer = Buffer.alloc(18 + pixels.length);
	// write header
	buffer.writeInt8(0, 0);
	buffer.writeInt8(0, 1);
	buffer.writeInt8(2, 2);
	buffer.writeInt16LE(0, 3);
	buffer.writeInt16LE(0, 5);
	buffer.writeInt8(0, 7);
	buffer.writeInt16LE(0, 8);
	buffer.writeInt16LE(0, 10);
	buffer.writeInt16LE(width, 12);
	buffer.writeInt16LE(height, 14);
	buffer.writeInt8(32, 16);
	buffer.writeInt8(8, 17);

	let offset = 18;
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			const idx = ((dontFlipY ? i : height - i - 1) * width + j) * 4;
			buffer.writeUInt8(pixels[idx + 1], offset++);    // b
			buffer.writeUInt8(pixels[idx + 2], offset++);    // g
			buffer.writeUInt8(pixels[idx + 3], offset++);    // r
			buffer.writeUInt8(255, offset++);          // a
		}
	}

	return buffer;
}

function processLanguage(paramPackData?: ParamPack): typeof translations.EN {
	if (!paramPackData) {
		return translations.EN;
	}
	switch (paramPackData.language_id) {
		case '0':
			return translations.JA;
		case '1':
			return translations.EN;
		case '2':
			return translations.FR;
		case '3':
			return translations.DE;
		case '4':
			return translations.IT;
		case '5':
			return translations.ES;
		case '6':
			return translations.ZH;
		case '7':
			return translations.KO;
		case '8':
			return translations.NL;
		case '9':
			return translations.PT;
		case '10':
			return translations.RU;
		case '11':
			return translations.ZH;
		default:
			return translations.EN;
	}
}

async function uploadCDNAsset(bucket: string, key: string, data: Buffer, acl: string): Promise<void> {
	const awsPutParams = {
		Body: data,
		Key: key,
		Bucket: bucket,
		ACL: acl
	};

	await s3.putObject(awsPutParams).promise();
}

async function newNotification(notification: Omit<INotification, 'read' | 'lastUpdated' | 'users'>): Promise<void> {
	const now = new Date();
	if (notification.type === 'follow') {
		// { pid: userToFollowContent.pid, type: "follow", objectID: req.pid, link: `/users/${req.pid}` }
		let existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, objectID: notification.objectID });
		if (existingNotification) {
			existingNotification.lastUpdated = now;
			existingNotification.read = false;
			await existingNotification.save();
		}
		const last60min = new Date(now.getTime() - 60 * 60 * 1000);
		existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, type: 'follow', lastUpdated: { $gte: last60min } });
		if (existingNotification) {
			existingNotification.users.push({
				user: notification.objectID,
				timeStamp: now
			});
			existingNotification.lastUpdated = now;
			existingNotification.link = notification.link;
			existingNotification.objectID = notification.objectID;
			existingNotification.read = false;
			await existingNotification.save();
		} else {
			const newNotification = new NOTIFICATION({
				pid: notification.pid,
				type: notification.type,
				users: [{
					user: notification.objectID,
					timestamp: now
				}],
				link: notification.link,
				objectID: notification.objectID,
				read: false,
				lastUpdated: now
			});
			await newNotification.save();
		}
	}
}

async function getFriends(pid: number): Promise<number[]> {
	try {
		const pids =  await friendsClient.getUserFriendPIDs({
			pid: pid
		}, {
			metadata: grpc.Metadata({
				'X-API-Key': friendsKey
			})
		});
		return pids.pids;
	} catch (e) {
		return [];
	}
}

async function getFriendRequests(pid: number): Promise<FriendRequest[]> {
	try {
		const requests = await friendsClient.getUserFriendRequestsIncoming({
			pid: pid
		}, {
			metadata: grpc.Metadata({
				'X-API-Key': friendsKey
			})
		});
		return requests.friendRequests;
	} catch (e) {
		return [];
	}
}

async function login(username: string, password: string): Promise<ApiLoginResponse> {
	return await apiClient.login({
		username: username,
		password: password,
		grantType: 'password'
	}, {
		metadata: grpc.Metadata({
			'X-API-Key': apiKey
		})
	});
}

async function refreshLogin(refreshToken: string): Promise<ApiLoginResponse> {
	return await apiClient.login({
		refreshToken: refreshToken
	}, {
		metadata: grpc.Metadata({
			'X-API-Key': apiKey
		})
	});
}

async function getUserDataFromToken(token: string): Promise<User> {
	return apiClient.getUserData({}, {
		metadata: grpc.Metadata({
			'X-API-Key': apiKey,
			'X-Token': token
		})
	});
}

async function getUserDataFromPid(pid: number): Promise<User> {
	return accountClient.getUserData({
		pid: pid
	}, {
		metadata: grpc.Metadata({
			'X-API-Key': apiKey
		})
	});
}

// TODO is this right?
export async function getPid(token: string): Promise<number> {
	const user = await getUserDataFromToken(token);
	return user.pid;
}

export default {
	decodeParamPack,
	processServiceToken,
	decryptToken,
	unpackToken,
	processPainting,
	nintendoPasswordHash,
	getCommunityHash,
	getUserHash,
	refreshCache,
	setName,
	resizeImage,
	createBMPTgaBuffer,
	processLanguage,
	uploadCDNAsset,
	newNotification,
	getFriends,
	getFriendRequests,
	login,
	refreshLogin,
	getUserDataFromToken,
	getUserDataFromPid,
	getPid,
	create_user,
	INVALID_POST_BODY_REGEX
};

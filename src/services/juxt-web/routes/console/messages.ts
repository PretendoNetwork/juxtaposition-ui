import express from 'express';
import database from '../../../../database';
import util from '../../../../util';
import config from '../../../../../config.json';
import { POST } from '../../../../models/post';
import moment from 'moment';
import { CONVERSATION } from '../../../../models/conversation';
import crypto from 'crypto';
import { IPost } from '@/types/mongoose/post';
import { Snowflake as snowflake } from 'node-snowflake';

const router = express.Router();

router.get('/', async function (req, res) {
	if (!req.pid) {
		res.status(400).send('PID missing');
		return;
	}
	const conversations = await database.getConversations(req.pid);
	const usersMap = await util.getUserHash();
	res.render(req.directory + '/messages.ejs', {
		moment: moment,
		pid: req.pid,
		conversations: conversations,
		cdnURL: config.CDN_domain,
		usersMap: usersMap,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		moderator: req.moderator
	});
});

router.post('/new', async function (req, res) {
	if (!req.pid) {
		res.status(400).send('PID missing');
		return;
	}
	let conversation = await database.getConversationByID(req.body.community_id);
	const user2 = await util.getUserDataFromPid(req.body.message_to_pid);
	const postID = await generatePostUID(21);
	const friends = await util.getFriends(user2.pid);
	if (req.body.community_id === 0) {
		return res.sendStatus(404);
	}
	if (!conversation) {
		if (!req.user || !user2) {
			return res.sendStatus(422);
		}
		const document = {
			id: snowflake.nextId(),
			users: [
				{
					pid: req.pid,
					official: (req.user.accessLevel >= 2),
					read: true
				},
				{
					pid: user2.pid,
					official: (user2.accessLevel >= 2),
					read: false
				},
			]
		};
		const newConversations = new CONVERSATION(document);
		await newConversations.save();
		conversation = await database.getConversationByID(document.id);
	}
	if (!conversation) {
		return res.sendStatus(404);
	}
	if (!friends || friends.indexOf(req.pid) === -1) {
		return res.sendStatus(422);
	}
	if (req.body.body === '' && req.body.painting === ''  && req.body.screenshot === '') {
		res.status(422);
		return res.redirect(`/friend_messages/${conversation.id}`);
	}
	let painting = '';
	let paintingURI: string | null = '';
	let screenshot = null;
	if (req.body._post_type === 'painting' && req.body.painting) {
		painting = req.body.painting.replace(/\0/g, '').trim();
		paintingURI = util.processPainting(painting, true);
		if (paintingURI) {
			await util.uploadCDNAsset('pn-cdn', `paintings/${req.pid}/${postID}.png`, Buffer.from(paintingURI, 'base64'), 'public-read');
		}
	}
	if (typeof req.body.screenshot === 'string') {
		screenshot = req.body.screenshot.replace(/\0/g, '').trim();
		await util.uploadCDNAsset('pn-cdn', `screenshots/${req.pid}/${postID}.jpg`, Buffer.from(screenshot, 'base64'), 'public-read');
	}

	let miiFace;
	switch (parseInt(req.body.feeling_id)) {
		case 1:
			miiFace = 'smile_open_mouth.png';
			break;
		case 2:
			miiFace = 'wink_left.png';
			break;
		case 3:
			miiFace = 'surprise_open_mouth.png';
			break;
		case 4:
			miiFace = 'frustrated.png';
			break;
		case 5:
			miiFace = 'sorrow.png';
			break;
		default:
			miiFace = 'normal_face.png';
			break;
	}
	const body = req.body.body;
	if (typeof body !== 'string' || util.INVALID_POST_BODY_REGEX.test(body)) {
		// TODO - Log this error
		res.sendStatus(422);
		return;
	}

	if (body && body.length > 280) {
		// TODO - Log this error
		res.sendStatus(422);
		return;
	}

	if (screenshot) {
		screenshot = `/screenshots/${req.pid}/${postID}.jpg`;
	} else {
		screenshot = '';
	}

	if (!painting) {
		painting = '';
	}

	const document: Partial<IPost> = {
		community_id: conversation.id,
		screen_name: req.user?.mii?.name,
		body: body,
		painting: painting,
		screenshot: screenshot ? `/screenshots/${req.pid}/${postID}.jpg`: '',
		country_id: req.paramPackData ? parseInt(req.paramPackData.country_id) : 49,
		created_at: new Date(),
		feeling_id: req.body.feeling_id,
		id: postID,
		is_autopost: 0,
		is_spoiler: (req.body.spoiler) ? 1 : 0,
		is_app_jumpable: req.body.is_app_jumpable,
		language_id: req.body.language_id,
		mii: req.user?.mii?.data,
		mii_face_url: `https://mii.olv.pretendo.cc/mii/${req.pid}/${miiFace}`,
		pid: req.pid,
		platform_id: req.paramPackData ? parseInt(req.paramPackData.platform_id) : 0,
		region_id: req.paramPackData ? parseInt(req.paramPackData.region_id) : 2,
		verified: ((req.user?.accessLevel ?? 0) >= 2),
		message_to_pid: req.body.message_to_pid
	};
	// const duplicatePost = await database.getDuplicatePosts(req.pid, body, painting, screenshot);
	// if (duplicatePost && req.params.post_id) {
	// 	return res.redirect('/posts/' + req.params.post_id);
	// }
	const newPost = new POST(document);
	newPost.save();
	res.redirect(`/friend_messages/${conversation.id}`);
	let postPreviewText: string;
	if (document.painting) {
		postPreviewText = 'sent a Drawing';
	} else if (body.length > 25) {
		postPreviewText = body.substring(0, 25) + '...';
	} else {
		postPreviewText = body;
	}
	await conversation.newMessage(postPreviewText, user2.pid);
});

router.get('/new/:pid', async function (req, res) {
	if (!req.pid) {
		res.status(400).send('PID missing');
		return;
	}
	const user2 = await util.getUserDataFromPid(parseInt(req.params.pid));
	const friends = await util.getFriends(user2.pid);
	if (!req.user || !user2) {
		return res.sendStatus(422);
	}
	let conversation = await database.getConversationByUsers([req.pid, user2.pid]);
	if (conversation) {
		return res.redirect(`/friend_messages/${conversation.id}`);
	}
	if (!friends || friends.indexOf(req.pid) === -1) {
		return res.sendStatus(422);
	}
	const document = {
		id: snowflake.nextId(),
		users: [
			{
				pid: req.user.pid,
				official: (req.user.accessLevel >= 2),
				read: true
			},
			{
				pid: user2.pid,
				official: (user2.accessLevel >= 2),
				read: false
			},
		]
	};
	const newConversations = new CONVERSATION(document);
	await newConversations.save();
	conversation = await database.getConversationByID(document.id);
	if (!conversation) {
		return res.sendStatus(404);
	}
	const body = `${req.user?.mii?.name} started a new chat!`;
	const newMessage = {
		screen_name: req.user?.mii?.name,
		body: body,
		created_at: new Date(),
		id: await generatePostUID(21),
		mii: req.user?.mii?.data,
		mii_face_url: `https://mii.olv.pretendo.cc/mii/${req.pid}/normal_face.png`,
		pid: req.pid,
		verified: (req.user.accessLevel >= 2),
		parent: null,
		community_id: conversation.id,
		message_to_pid: user2.pid
	};
	const newPost = new POST(newMessage);
	newPost.save();
	await conversation.newMessage(`${req.user?.mii?.name} started a new chat!`, user2.pid);
	res.redirect(`/friend_messages/${conversation.id}`);
});

router.get('/:message_id', async function (req, res) {
	if (!req.pid) {
		res.status(400).send('PID missing');
		return;
	}
	const conversation = await database.getConversationByID(req.params.message_id);
	if (!conversation) {
		return res.sendStatus(404);
	}
	const user2 = conversation.users[0].pid === req.pid ? conversation.users[1] : conversation.users[0];
	if (req.pid !== conversation.users[0].pid && req.pid !== conversation.users[1].pid) {
		res.redirect('/');
	}
	const messages = await database.getConversationMessages(conversation.id, 200, 0);
	const userMap = await util.getUserHash();
	res.render(req.directory + '/message_thread.ejs', {
		moment: moment,
		user2: user2,
		conversation: conversation,
		messages: messages,
		userMap: userMap,
		cdnURL: config.CDN_domain,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		pid: req.pid,
		moderator: req.moderator
	});
	await conversation.markAsRead(req.pid);
});

async function generatePostUID(length: number): Promise<string> {
	let id = Buffer.from(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length * 2))), 'binary').toString('base64').replace(/[+/]/g, '').substring(0, length);
	const inuse = await POST.findOne({ id });
	id = (inuse ? await generatePostUID(length) : id);
	return id;
}

export default router;

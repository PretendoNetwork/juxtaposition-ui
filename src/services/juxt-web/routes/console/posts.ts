import express from 'express';
import database from '../../../../database';
import util from '../../../../util';
import config from '../../../../../config.json';
import { POST } from '../../../../models/post';
import multer from 'multer';
import moment from 'moment';
import rateLimit from 'express-rate-limit';
import { REPORT } from '../../../../models/report';
import crypto from 'crypto';
import redis from '../../../../redisCache';
import { Request, Response } from 'express';
import { IPost } from '@/types/mongoose/post';

const upload = multer({dest: 'uploads/'});
const router = express.Router();

const postLimit = rateLimit({
	windowMs: 15 * 1000, // 30 seconds
	max: 10, // Limit each IP to 1 request per `window`
	standardHeaders: true,
	legacyHeaders: true,
	message: 'New post limit reached. Try again in a minute',
	handler: function (req, res) {
		if (req.params.post_id) {
			res.redirect('/posts/' + req.params.post_id.toString());
		} else if (req.body.community_id) {
			res.redirect('/titles/' + req.body.community_id);
		} else {
			res.render(req.directory + '/error.ejs', {
				code: 429,
				message: 'Too many new posts have been created.',
				cdnURL: config.CDN_domain,
				lang: req.lang,
				pid: req.pid
			});
		}
	},
});

const yeahLimit = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 10, // Limit each IP to 60 requests per `window`
	standardHeaders: true,
	legacyHeaders: true,
});

router.get('/:post_id/oembed.json', async function (req, res) {

	const post = await database.getPostByID(req.params.post_id.toString());

	if (!post) {
		res.sendStatus(404);
		return;
	}

	const doc = {
		'author_name': post.screen_name,
		'author_url': 'https://juxt.pretendo.network/users/show?pid=' + post.pid,
	};

	res.send(doc);
});

router.post('/empathy', yeahLimit, async function (req, res) {

	const post = await database.getPostByID(req.body.postID);

	if (!post) {
		res.sendStatus(404);
		return;
	}

	if (!req.pid) {
		res.status(400).send('PID missing');
		return;
	}

	if (post.yeahs.indexOf(req.pid) === -1) {
		await POST.updateOne({
			id: post.id,
			yeahs: {
				$ne: req.pid
			}
		},
		{
			$inc: {
				empathy_count: 1
			},
			$push: {
				yeahs: req.pid
			}
		});
		res.send({status: 200, id: post.id, count: post.empathy_count + 1});
		if (req.pid !== post.pid) {
			await util.newNotification({
				pid: post.pid.toString(),
				type: 'yeah',
				objectID: post.id,
				link: `/posts/${post.id}`
			});
		}
	} else if (post.yeahs.indexOf(req.pid) !== -1) {
		await POST.updateOne({
			id: post.id,
			yeahs: {
				$eq: req.pid
			}
		},
		{
			$inc: {
				empathy_count: -1
			},
			$pull: {
				yeahs: req.pid
			}
		});
		res.send({status: 200, id: post.id, count: post.empathy_count - 1});
	} else {
		res.send({status: 423, id: post.id, count: post.empathy_count});
	}
	await redis.removeValue(`${post.pid}_user_page_posts`);
});

router.post('/new', postLimit, upload.none(), async function (req, res) {
	await newPost(req, res);
});

router.get('/:post_id', async function (req, res) {
	const userSettings = await database.getUserSettings(req.pid);
	const userContent = await database.getUserContent(req.pid);
	let post = await database.getPostByID(req.params.post_id.toString());
	if (post === null) {
		return res.redirect('/404');
	}
	if (post.parent) {
		post = await database.getPostByID(post.parent);
		if (post === null) {
			return res.sendStatus(404);
		}
		return res.redirect(`/posts/${post.id}`);
	}
	const community = await database.getCommunityByID(post.community_id);
	const communityMap = util.getCommunityHash();
	const replies = await database.getPostReplies(req.params.post_id.toString(), 25);
	const postPNID = await util.getUserDataFromPid(post.pid);
	res.render(req.directory + '/post.ejs', {
		moment: moment,
		userSettings: userSettings,
		userContent: userContent,
		post: post,
		replies: replies,
		community: community,
		communityMap: communityMap,
		cdnURL: config.CDN_domain,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		pid: req.pid,
		postPNID,
		pnid: req.user,
		moderator: req.moderator
	});
});

router.delete('/:post_id', async function (req, res) {

	if (!req.pid) {
		res.status(400).send('PID missing');
		return;
	}

	const post = await database.getPostByID(req.params.post_id);
	if (!post) {
		return res.sendStatus(404);
	}

	if (req.pid !== post.pid && !req.moderator) {
		return res.sendStatus(401);
	}

	if (req.moderator && req.pid !== post.pid) {

		let reason: string = 'Removed by moderator';
		if (req.query.reason && typeof req.query.reason === 'string') {
			reason = req.query.reason;
		}
		await post.removePost(reason, req.pid);
	} else {
		await post.removePost('User requested removal', req.pid);
	}

	res.statusCode = 200;
	if (post.parent) {
		res.send(`/posts/${post.parent}`);
	} else {
		res.send('/users/me');
	}
	await redis.removeValue(`${post.pid}_user_page_posts`);
});

router.post('/:post_id/new', postLimit, upload.none(), async function (req, res) {
	await newPost(req, res);
});

router.post('/:post_id/report', upload.none(), async function (req, res) {

	if (!req.pid) {
		res.status(400).send('PID missing');
		return;
	}

	const { reason, message, post_id } = req.body;
	const post = await database.getPostByID(post_id);
	if (!reason || !post_id || !post) {
		return res.redirect('/404');
	}

	const duplicate = await database.getDuplicateReports(req.pid, post_id);
	if (duplicate) {
		return res.redirect(`/posts/${post.id}`);
	}

	const reportDoc = {
		pid: post.pid,
		reported_by: req.pid,
		post_id,
		reason,
		message,
		created_at: new Date()
	};

	const reportObj = new REPORT(reportDoc);
	await reportObj.save();

	return res.redirect(`/posts/${post.id}`);
});

async function newPost(req: Request, res: Response): Promise<void> {

	if (!req.pid) {
		res.status(400).send('PID missing');
		return;
	}

	const userSettings = await database.getUserSettings(req.pid); let parentPost = null; const postID = await generatePostUID(21);
	const community = await database.getCommunityByID(req.body.community_id);
	if (!community || !userSettings || !req.user) {
		res.status(403);
		console.log('missing data');
		return res.redirect('/titles/show');
	}
	if (req.params.post_id && (req.body.body === '' && req.body.painting === '' && req.body.screenshot === '')) {
		res.status(422);
		return res.redirect('/posts/' + req.params.post_id.toString());
	}
	if (req.params.post_id) {
		parentPost = await database.getPostByID(req.params.post_id.toString());
		if (!parentPost) {
			res.sendStatus(403);
			return;
		}
	}
	if (!(community.admins && community.admins.indexOf(req.pid) !== -1 && userSettings.account_status === 0) && req.user.accessLevel >= community.permissions.minimum_new_post_access_level
        && (community.type >= 2) && !(parentPost && req.user.accessLevel >= community.permissions.minimum_new_comment_access_level && community.permissions.open)) {
		res.status(403);
		return res.redirect(`/titles/${community.olive_community_id}/new`);
	}

	let painting: string | null = '';
	let paintingURI: string | null = '';
	let screenshot = null;
	if (req.body._post_type === 'painting' && req.body.painting) {
		if (req.body.bmp === 'true') {
			painting = util.processPainting(req.body.painting.replace(/\0/g, '').trim(), false);
		} else {
			painting = req.body.painting;
		}
		paintingURI = util.processPainting(painting, true);
		if (paintingURI) {
			await util.uploadCDNAsset('pn-cdn', `paintings/${req.pid}/${postID}.png`, Buffer.from(paintingURI, 'base64'), 'public-read');
		}
	}
	if (req.body.screenshot) {
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
		title_id: community.title_id[0],
		community_id: community.olive_community_id,
		screen_name: userSettings.screen_name,
		body,
		painting,
		screenshot,
		country_id: req.paramPackData ? parseInt(req.paramPackData.country_id) : 49,
		created_at: new Date(),
		feeling_id: req.body.feeling_id,
		id: postID,
		is_autopost: 0,
		is_spoiler: (req.body.spoiler) ? 1 : 0,
		is_app_jumpable: req.body.is_app_jumpable,
		language_id: req.body.language_id,
		mii: req.user.mii?.data ?? '',
		mii_face_url: `https://mii.olv.pretendo.cc/mii/${req.user.pid}/${miiFace}`,
		pid: req.pid,
		platform_id: req.paramPackData ? parseInt(req.paramPackData.platform_id) : 0,
		region_id: req.paramPackData ? parseInt(req.paramPackData.region_id) : 2,
		verified: req.moderator,
		parent: parentPost ? parentPost.id : null,
	};
	const duplicatePost = await database.getDuplicatePosts(req.pid, body, painting, screenshot);
	if (duplicatePost && req.params.post_id) {
		return res.redirect('/posts/' + req.params.post_id.toString());
	}
	if (document.body === '' && document.painting === '' && document.screenshot === '' || duplicatePost) {
		return res.redirect('/titles/' + community.olive_community_id + '/new');
	}
	const newPost = new POST(document);
	newPost.save();
	if (parentPost) {
		parentPost.reply_count = parentPost.reply_count + 1;
		parentPost.save();
	}
	if (parentPost && (parentPost.pid !== req.user.pid)) {
		await util.newNotification({
			pid: parentPost.pid.toString(),
			type: 'reply',
			objectID: req.pid.toString(),
			link: `/posts/${parentPost.id}`
		});
	}
	if (parentPost) {
		res.redirect('/posts/' + req.params.post_id.toString());
		await redis.removeValue(`${parentPost.pid}_user_page_posts`);
	} else {
		res.redirect('/titles/' + community.olive_community_id + '/new');
		await redis.removeValue(`${req.pid}_user_page_posts`);
	}
}

async function generatePostUID(length: number): Promise<string> {
	let id = Buffer.from(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length * 2))), 'binary').toString('base64').replace(/[+/]/g, '').substring(0, length);
	const inuse = await POST.findOne({id});
	id = (inuse ? await generatePostUID(length) : id);
	return id;
}


export default router;

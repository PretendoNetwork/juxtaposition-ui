import express from 'express';
import multer from 'multer';
import moment from 'moment';
import * as database from '@/database';
import * as util from '@/util';
import * as redis from '@/redisCache';
import { POST } from '@/models/post';
import { SETTINGS } from '@/models/settings';
import type { Request, Response } from 'express';
import type { IPost } from '@/types/mongoose/post';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';
import config from '../../../../../config.json';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/menu', async function (req, res) {
	const user = await database.getUserSettings(req.pid);
	res.render('ctr/user_menu.ejs', {
		user: user,
	});
});

router.get('/me', async function (req, res) {
	await userPage(req, res, req.pid);
});

router.get('/notifications.json', async function (req, res) {
	const notifications = await database.getUnreadNotificationCount(req.pid);
	const messagesCount = await database.getUnreadConversationCount(req.pid);

	res.send(
		{
			message_count: messagesCount,
			notification_count: notifications,
		}
	);
});

router.get('/downloadUserData.json', async function (req, res) {
	res.set('Content-Type', 'text/json');
	res.set('Content-Disposition', `attachment; filename="${req.pid}_user_data.json"`);
	const posts = await POST.find({ pid: req.pid });
	const userContent = await database.getUserSettings(req.pid);
	const userSettings = await database.getUserContent(req.pid);
	const doc = {
		'user_content': userContent,
		'user_settings': userSettings,
		'posts': posts,
	};
	res.send(doc);
});

router.get('/me/settings', async function (req, res) {
	const userSettings = await database.getUserSettings(req.pid);
	const communityMap = await util.getCommunityHash();
	res.render(req.directory + '/settings.ejs', {
		communityMap: communityMap,
		moment: moment,
		userSettings: userSettings,
		account_server: config.account_server_domain.slice(8),
		cdnURL: config.CDN_domain,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		pid: req.pid,
		moderator: req.moderator
	});
});

router.get('/me/:type', async function (req, res) {
	await userRelations(req, res, req.pid); 
});

router.post('/me/settings', upload.none(), async function (req, res) {

	const userSettings = await database.getUserSettings(req.pid);

	if (!userSettings) {
		res.status(400).send('No user settings found');
		return;
	}

	userSettings.country_visibility = !!req.body.country;
	userSettings.birthday_visibility = !!req.body.birthday;
	userSettings.game_skill_visibility = !!req.body.experience;
	userSettings.profile_comment_visibility = !!req.body.comment;

	if (req.body.comment) {
		userSettings.updateComment(req.body.comment);
	} else {
		userSettings.updateComment('');
	}

	res.redirect('/users/me');
});

router.get('/show', async function (req, res) {
	res.redirect(`/users/${req.query.pid}`);
});

router.get('/:pid/more', async function (req, res) {
	await morePosts(req, res, parseInt(req.params.pid));
});

router.get('/:pid/:type', async function (req, res) {
	await userRelations(req, res, parseInt(req.params.pid));
});

// TODO: Remove the need for a parameter to toggle the following state
router.post('/follow', upload.none(), async function (req, res) {

	if (!req.body.id) {
		res.status(400).send('Invalid request body');
		return;
	}

	const userToFollowContent = await database.getUserContent(req.body.id);
	const userContent = await database.getUserContent(req.pid);

	if (userContent && userToFollowContent) {

		if (userContent.followed_users.indexOf(userToFollowContent.pid) === -1) {
			userToFollowContent.addToFollowers(userContent.pid);
			userContent.addToUsers(userToFollowContent.pid);
			res.send({ status: 200, id: userToFollowContent.pid, count: userToFollowContent.following_users.length - 1 });
			const picked = await database.getNotification(userToFollowContent.pid, '2', userContent.pid);
			//pid, type, reference_id, origin_pid, title, content
			if (picked === null) {
				await util.newNotification({ pid: userToFollowContent.pid.toString(), type: 'follow', objectID: req.pid?.toString(), link: `/users/${req.pid}` });
			}
			return;
		} else {
			userToFollowContent.removeFromFollowers(userContent.pid);
			userContent.removeFromUsers(userToFollowContent.pid);
			res.send({ status: 200, id: userToFollowContent.pid, count: userToFollowContent.following_users.length - 1 });
			return;
		}
	}

	res.send({ status: 423, id: userToFollowContent?.pid, count: (userToFollowContent?.following_users.length ?? 0) - 1 });
});

router.get('/:pid', async function (req, res) {
	const userID = req.params.pid;
	if (userID === 'me' || Number(userID) === req.pid) {
		return res.redirect('/users/me');
	}

	await userPage(req, res, parseInt(userID));
});

router.get('/:pid/:type', async function (req, res) {
	const userID = req.params.pid;
	if (userID === 'me' || Number(userID) === req.pid) {
		return res.redirect('/users/me');
	}
	await userRelations(req, res, parseInt(userID));
});

async function userPage(req: Request, res: Response, userID: number): Promise<void> {
	if (!userID || isNaN(userID)) {
		return res.redirect('/404');
	}
	const pnid = userID === req.pid ? req.user : await util.getUserDataFromPid(userID).catch((e) => {
		console.log(e.details);
	});
	const userContent = await database.getUserContent(userID);
	if (isNaN(userID) || !pnid || !userContent) {
		return res.redirect('/404');
	}

	const userSettings = await database.getUserSettings(userID);
	const cachedPosts = await redis.getValue(`${userID}-user_page_posts`);
	let posts: IPost[];
	if (cachedPosts) {
		posts = JSON.parse(cachedPosts);
	} else {
		posts = await database.getNumberUserPostsByID(userID, config.post_limit);
		await redis.setValue(`${userID}_user_page_posts`, JSON.stringify(posts), 60 * 60 * 1);
	}

	const numPosts = await database.getTotalPostsByUserID(userID);
	const communityMap = await util.getCommunityHash();
	let friends: number[] = [];
	try {
		friends = await util.getFriends(userID);
	} catch (e) {}

	let parentUserContent;
	if (pnid.pid !== req.pid) {
		parentUserContent = await database.getUserContent(req.pid);
	}

	const bundle = {
		posts,
		open: true,
		numPosts,
		communityMap,
		userContent: parentUserContent ? parentUserContent : userContent,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		link: `/users/${userID}/more?offset=${posts.length}&pjax=true`
	};
	if (req.query.pjax) {
		return res.render(req.directory + '/partials/posts_list.ejs', {
			bundle,
			lang: req.lang,
			moment
		});
	}
	const link = (pnid.pid === req.pid) ? '/users/me/' : `/users/${userID}/`;

	res.render(req.directory + '/user_page.ejs', {
		template: 'posts_list',
		selection: 0,
		moment,
		pnid,
		numPosts,
		userContent,
		userSettings,
		bundle,
		account_server: config.account_server_domain.slice(8),
		cdnURL: config.CDN_domain,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		pid: req.pid,
		link,
		friends,
		parentUserContent,
		moderator: req.moderator
	});
}

async function userRelations(req: Request, res: Response, userID: number | null): Promise<void> {
	if (!userID) {
		res.redirect('/404');
		return;
	}

	const pnid = userID === req.pid ? req.user : await util.getUserDataFromPid(userID);
	if (!pnid) {
		res.redirect('/404');
		return;
	}

	const userContent = await database.getUserContent(userID);
	if (!userContent) {
		res.redirect('/404');
		return;
	}

	const link = (pnid.pid === req.pid) ? '/users/me/' : `/users/${userID}/`;
	const userSettings = await database.getUserSettings(userID);
	const numPosts = await database.getTotalPostsByUserID(userID);
	const friends = await util.getFriends(userID);

	let parentUserContent;
	if (pnid.pid !== req.pid) {
		parentUserContent = await database.getUserContent(req.pid);
	}
	if (isNaN(userID) || !pnid) {
		return res.redirect('/404');
	}

	const communityMap = util.getCommunityHash();

	if (req.params.type === 'yeahs') {
		const posts = await POST.find({ yeahs: req.pid, removed: false }).sort({created_at: -1});
		const bundle = {
			posts,
			open: true,
			numPosts: posts.length,
			communityMap,
			userContent: parentUserContent ? parentUserContent : userContent,
			lang: req.lang,
			mii_image_CDN: config.mii_image_CDN,
			link: `/users/${userID}/yeahs/more?offset=${posts.length}&pjax=true`
		};

		if (req.query.pjax) {
			return res.render(req.directory + '/partials/posts_list.ejs', {
				bundle,
				lang: req.lang,
				moment
			});
		} else {
			return res.render(req.directory + '/user_page.ejs', {
				template: 'posts_list',
				selection: 4,
				moment,
				pnid,
				numPosts,
				userContent,
				userSettings,
				bundle,
				account_server: config.account_server_domain.slice(8),
				cdnURL: config.CDN_domain,
				lang: req.lang,
				mii_image_CDN: config.mii_image_CDN,
				pid: req.pid,
				link,
				friends,
				parentUserContent,
				moderator: req.moderator
			});
		}
	}

	let followers: HydratedSettingsDocument[];
	let communities: string[];
	let selection: number;
	if (req.params.type === 'friends') {
		followers = await SETTINGS.find({ pid: friends });
		communities = [];
		selection = 2;
	} else if (req.params.type === 'followers') {
		followers = await database.getFollowingUsers(userContent);
		communities = [];
		selection = 3;
	} else {
		followers = await database.getFollowedUsers(userContent);
		communities = userContent.followed_communities;
		selection = 2;
	}

	if (communities[0] === '0') {
		communities.splice(0, 1);
	}

	const bundle = {
		followers: followers ? followers : [],
		communities: communities,
		communityMap: communityMap
	};

	if (req.query.pjax) {
		return res.render(req.directory + '/partials/following_list.ejs', {
			bundle,
		});
	}
	res.render(req.directory + '/user_page.ejs', {
		template: 'following_list',
		selection: selection,
		moment,
		pnid,
		numPosts,
		userContent,
		userSettings,
		bundle,
		account_server: config.account_server_domain.slice(8),
		cdnURL: config.CDN_domain,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		pid: req.pid,
		link,
		parentUserContent,
		moderator: req.moderator
	});
}

async function morePosts(req: Request, res: Response, userID: number): Promise<void> {

	let offset: number | undefined = undefined;
	if (typeof req.query.offset === 'string') {
		offset = parseInt(req.query.offset);
	}

	const userContent = await database.getUserContent(req.pid);
	const communityMap = util.getCommunityHash();

	const posts = await database.getUserPostsOffset(userID, config.post_limit, offset);

	const bundle = {
		posts,
		numPosts: posts.length,
		open: true,
		communityMap,
		userContent,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		link: `/users/${userID}/more?offset=${(offset ?? 0) + posts.length}&pjax=true`
	};

	if (posts.length > 0) {
		res.render(req.directory + '/partials/posts_list.ejs', {
			communityMap: communityMap,
			moment: moment,
			database: database,
			bundle,
			account_server: config.account_server_domain.slice(8),
			cdnURL: config.CDN_domain,
			lang: req.lang,
			mii_image_CDN: config.mii_image_CDN,
			pid: req.pid,
			moderator: req.moderator
		});
	} else {
		res.sendStatus(204);
	}
}

export default router;
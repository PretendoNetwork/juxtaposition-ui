import express from 'express';
import database from '../../../../database';
import util from '../../../../util';
import config from '../../../../../config.json';
import moment from 'moment';
import { HydratedPostDocument } from '@/types/mongoose/post';

const router = express.Router();

router.get('/', async function (req, res) {
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await util.getCommunityHash();
	if (!userContent) {
		return res.redirect('/404');
	}
	const posts = await database.getNewsFeed(userContent, config.post_limit);

	const bundle = {
		posts,
		open: true,
		communityMap,
		userContent,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		link: `/feed/more?offset=${posts.length}&pjax=true`
	};

	if (req.query.pjax) {
		return res.render(req.directory + '/partials/posts_list.ejs', {
			bundle,
			moment,
			lang: req.lang
		});
	}

	res.render(req.directory + '/feed.ejs', {
		moment: moment,
		title: req.lang.global.activity_feed,
		userContent: userContent,
		posts: posts,
		communityMap: communityMap,
		account_server: config.account_server_domain.slice(8),
		cdnURL: config.CDN_domain,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		pid: req.pid,
		bundle,
		template: 'posts_list',
		moderator: req.moderator
	});
});

router.get('/more', async function (req, res) {

	let offset = 0;
	if (typeof req.query?.offset === 'string') {
		offset = parseInt(req.query.offset);
	}

	const userContent = await database.getUserContent(req.pid);
	const communityMap = util.getCommunityHash();

	let posts: HydratedPostDocument[] = [];
	if (userContent) {
		posts = await database.getNewsFeedOffset(userContent, config.post_limit, offset);
	}

	const bundle = {
		posts,
		numPosts: posts.length,
		open: true,
		communityMap,
		userContent,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		link: `/feed/more?offset=${offset + posts.length}&pjax=true`,
		moderator: req.moderator
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
});

export default router;

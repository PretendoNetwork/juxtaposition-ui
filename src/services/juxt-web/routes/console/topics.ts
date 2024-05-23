import express from 'express';
import moment from 'moment';
import database from '@/database';
import util from '@/util';
import { POST } from '@/models/post';
import config from '../../../../../config.json';

const router = express.Router();

router.get('/', async function (req, res) {
	const userContent = await database.getUserContent(req.pid);
	const communityMap = util.getCommunityHash();
	const tag = req.query.topic_tag;
	console.log(tag);
	if (!userContent || !tag) {
		return res.redirect('/404');
	}
	
	let limit: number | undefined;
	if (typeof req.query?.limit === 'string') {
		limit = parseInt(req.query.limit);
	}

	const options = {
		limit,
		sort: { created_at: -1 }
	};

	const posts = await POST.find({ topic_tag: req.query.topic_tag }, {}, options);

	const bundle = {
		posts,
		open: true,
		communityMap,
		userContent,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		link: `/topics/more?tag=${tag}&offset=${posts.length}&pjax=true`
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
		title: tag,
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
	const userContent = await database.getUserContent(req.pid);
	const communityMap = util.getCommunityHash();

	let limit: number | undefined;
	if (typeof req.query?.limit === 'string') {
		limit = parseInt(req.query.limit);
	}

	let offset: number | undefined;
	if (typeof req.query?.offset === 'string') {
		limit = parseInt(req.query.offset);
	}

	const options = {
		sort: { created_at: -1 },
		limit,
		offset
	};
	
	const tag = req.query.topic_tag;
	if (!tag) {
		return res.sendStatus(204);
	}
	const posts = await POST.find({ topic_tag: req.query.topic_tag }, {}, options);

	const bundle = {
		posts,
		numPosts: posts.length,
		open: true,
		communityMap,
		userContent,
		lang: req.lang,
		mii_image_CDN: config.mii_image_CDN,
		link: `/topics/more?tag=${tag}&offset=${(offset ?? 0) + posts.length}&pjax=true`
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

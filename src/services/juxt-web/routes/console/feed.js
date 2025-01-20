const express = require('express');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const moment = require('moment');
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
		link: `/feed/more?offset=${posts.length}&pjax=true`
	};

	if (req.query.pjax) {
		return res.render(req.directory + '/partials/posts_list.ejs', {
			bundle,
			moment,
		});
	}

	res.render(req.directory + '/feed.ejs', {
		moment: moment,
		title: res.locals.lang.global.activity_feed,
		userContent: userContent,
		posts: posts,
		communityMap: communityMap,
		account_server: config.account_server_domain.slice(8),
		bundle,
		template: 'posts_list'
	});
});

router.get('/more', async function (req, res) {
	let offset = parseInt(req.query.offset);
	const userContent = await database.getUserContent(req.pid);
	const communityMap = await util.getCommunityHash();
	if (!offset) {
		offset = 0;
	}
	const posts = await database.getNewsFeedOffset(userContent, config.post_limit, offset);

	const bundle = {
		posts,
		numPosts: posts.length,
		open: true,
		communityMap,
		userContent,
		link: `/feed/more?offset=${offset + posts.length}&pjax=true`
	};

	if (posts.length > 0) {
		res.render(req.directory + '/partials/posts_list.ejs', {
			communityMap: communityMap,
			moment: moment,
			database: database,
			bundle,
			account_server: config.account_server_domain.slice(8)
		});
	} else {
		res.sendStatus(204);
	}
});

module.exports = router;

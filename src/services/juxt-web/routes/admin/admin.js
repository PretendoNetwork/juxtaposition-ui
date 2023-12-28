const express = require('express');
const database = require('../../../../database');
const { POST } = require('../../../../models/post');
const { SETTINGS } = require('../../../../models/settings');
const util = require('../../../../util');
const moment = require('moment');
const config = require('../../../../../config.json');
const router = express.Router();

router.get('/posts', async function (req, res) {
	if (!req.moderator) {
		return res.redirect('/titles/show');
	}

	const reports = await database.getAllOpenReports();
	const communityMap = await util.data.getCommunityHash();
	const userContent = await database.getUserContent(req.pid);
	const userMap = util.data.getUserHash();
	const postIDs = reports.map(obj => obj.post_id);

	const posts = await POST.aggregate([
		{ $match: { id: { $in: postIDs } } },
		{$addFields: {
			'__order': { $indexOfArray: [ postIDs, '$id' ] }
		}},
		{ $sort: { '__order': 1 } },
		{ $project: { index: 0, _id: 0 } }
	]);

	res.render(req.directory + '/reports.ejs', {
		lang: req.lang,
		moment: moment,
		cdnURL: config.CDN_domain,
		mii_image_CDN: config.mii_image_CDN,
		pid: req.pid,
		moderator: req.moderator,
		userMap,
		communityMap,
		userContent,
		reports,
		posts
	});
});

router.get('/accounts', async function (req, res) {
	if (!req.moderator) {
		return res.redirect('/titles/show');
	}

	const users = await database.getUsersContent();
	const userMap = await util.data.getUserHash();
	res.render(req.directory + '/users.ejs', {
		lang: req.lang,
		moment: moment,
		cdnURL: config.CDN_domain,
		mii_image_CDN: config.mii_image_CDN,
		pid: req.pid,
		moderator: req.moderator,
		userMap,
		users
	});
});

router.get('/accounts/:pid', async function (req, res) {
	if (!req.moderator) {
		return res.redirect('/titles/show');
	}
	const pnid = await util.data.getUserDataFromPid(req.params.pid).catch((e) => {
		console.log(e.details);
	});
	const userContent = await database.getUserContent(req.params.pid);
	if (isNaN(req.params.pid) || !pnid || !userContent) {
		return res.redirect('/404');
	}
	const userSettings = await database.getUserSettings(req.params.pid);
	const posts = await database.getNumberUserPostsByID(req.params.pid, config.post_limit);
	const communityMap = await util.data.getCommunityHash();

	res.render(req.directory + '/moderate_user.ejs', {
		lang: req.lang,
		moment: moment,
		cdnURL: config.CDN_domain,
		mii_image_CDN: config.mii_image_CDN,
		pid: req.pid,
		moderator: req.moderator,
		userSettings,
		userContent,
		posts,
		communityMap,
		pnid
	});
});

router.post('/accounts/:pid', async (req, res) => {
	if (!req.moderator) {
		return res.redirect('/titles/show');
	}

	const { pid } = req.params;
	await SETTINGS.findOneAndUpdate({pid: pid}, {
		account_status: req.body.account_status,
		ban_lift_date: req.body.ban_lift_date,
		ban_reason: `${req.user.username} (${req.pid}): ${req.body.ban_reason}`
	});

	res.json({
		error: false
	});
});

router.delete('/:reportID', async function (req, res) {
	if (!req.moderator) {
		return res.sendStatus(401);
	}

	const report = await database.getReportById(req.params.reportID);
	if (!report) {
		return res.sendStatus(402);
	}
	const post = await database.getPostByID(report.post_id);
	if (!post) {
		return res.sendStatus(404);
	}

	await post.removePost(req.query.reason ? req.query.reason : 'Removed by moderator', req.pid);
	await report.resolve(req.pid, req.query.reason ? req.query.reason : 'Removed by moderator');

	return res.sendStatus(200);
});

router.put('/:reportID', async function (req, res) {
	if (!req.moderator) {
		return res.sendStatus(401);
	}

	const report = await database.getReportById(req.params.reportID);
	if (!report) {
		return res.sendStatus(402);
	}

	await report.resolve(req.pid, req.query.reason);

	return res.sendStatus(200);
});

module.exports = router;

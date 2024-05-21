import express from 'express';
import database from '../../../../database';
import { POST } from '../../../../models/post';
import { SETTINGS } from '../../../../models/settings';
import util from '../../../../util';
import moment from 'moment';
import config from '../../../../../config.json';
import { HydratedPostDocument } from '@/types/mongoose/post';

const router = express.Router();

router.get('/posts', async function (req, res): Promise<void> {
	if (!req.moderator) {
		return res.redirect('/titles/show');
	}

	const reports = await database.getAllOpenReports();
	const communityMap = await util.getCommunityHash();
	const userContent = await database.getUserContent(req.pid);
	const userMap = util.getUserHash();
	const postIDs = reports.map(obj => obj.post_id);

	const posts = await POST.aggregate<HydratedPostDocument>([
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

	let search: string;
	if (typeof req.query.search === 'string') {
		search = req.query.search;
	} else {
		search = '';
	}

	const page = (req.query.page && typeof req.query.page === 'string') ? parseInt(req.query.page) : 0;
	const limit = 20;

	const users = search ? await database.getUserSettingsFuzzySearch(search, limit, page * limit) : await database.getUsersContent(limit, page * limit);
	const userMap = await util.getUserHash();

	res.render(req.directory + '/users.ejs', {
		lang: req.lang,
		moment: moment,
		cdnURL: config.CDN_domain,
		mii_image_CDN: config.mii_image_CDN,
		pid: req.pid,
		moderator: req.moderator,
		userMap,
		users,
		page,
		search
	});
});


router.get('/accounts/:pid', async function (req, res): Promise<void> {
	if (!req.moderator) {
		return res.redirect('/titles/show');
	}
	const pid = parseInt(req.params.pid);
	const pnid = await util.getUserDataFromPid(pid).catch((e) => {
		console.log(e.details);
	});
	const userContent = await database.getUserContent(pid);
	if (isNaN(pid) || !pnid || !userContent) {
		return res.redirect('/404');
	}
	const userSettings = await database.getUserSettings(pid);
	const posts = await database.getNumberUserPostsByID(pid, config.post_limit);
	const communityMap = util.getCommunityHash();

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
		ban_reason: `${req.user?.username} (${req.pid}): ${req.body.ban_reason}`
	});

	res.json({
		error: false
	});
});

router.delete('/:reportID', async function (req, res) {
	if (!req.moderator || !req.pid) {
		return res.sendStatus(401);
	}

	const reportID = parseInt(req.params.reportID);
	const report = await database.getReportById(reportID);
	if (!report) {
		return res.sendStatus(402);
	}
	const post = await database.getPostByID(report.post_id);
	if (!post) {
		return res.sendStatus(404);
	}

	let reason: string = 'Removed by moderator';
	if (req.query.reason && typeof req.query.reason === 'string') {
		reason = req.query.reason;
	}

	await post.removePost(reason, req.pid);
	await report.resolve(req.pid, reason);

	return res.sendStatus(200);
});

router.put('/:reportID', async function (req, res) {
	if (!req.moderator || !req.pid) {
		return res.sendStatus(401);
	}

	const reportID = parseInt(req.params.reportID);

	const report = await database.getReportById(reportID);
	if (!report) {
		return res.sendStatus(402);
	}

	let reason = '';
	if (req.query.reason && typeof req.query.reason === 'string') {
		reason = req.query.reason;
	}

	await report.resolve(req.pid, reason);

	return res.sendStatus(200);
});

export default router;

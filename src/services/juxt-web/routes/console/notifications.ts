import express from 'express';
import database from '../../../../database';
import config from '../../../../../config.json';
import util from '../../../../util';
import moment from 'moment';
const router = express.Router();

router.get('/my_news', async function (req, res) {
	if (!req.pid) {
		res.status(400).send('PID missing');
		return;
	}

	const notifications = await database.getNotifications(req.pid, 25, 0);
	const userMap = util.getUserHash();
	const bundle = {
		notifications,
		userMap
	};

	if (req.query.pjax) {
		return res.render(req.directory + '/partials/notifications.ejs', {
			bundle,
			lang: req.lang,
			moment
		});
	}

	res.render(req.directory + '/notifications.ejs', {
		moment,
		selection: 0,
		bundle,
		cdnURL: config.CDN_domain,
		lang: req.lang,
		pid: req.pid,
		template: 'notifications',
		moderator: req.moderator
	});
	notifications.filter(noti => noti.read === false).forEach(function(notification) {
		notification.markRead();
	});
});

router.get('/friend_requests', async function (req, res) {
	if (!req.pid) {
		res.status(400).send('PID missing');
		return;
	}

	let requests = (await util.getFriendRequests(req.pid)).reverse();
	const now = new Date();
	requests = requests.filter(request => new Date(Number(request.expires) * 1000) > new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
	const userMap = util.getUserHash();
	const bundle = {
		requests: requests ? requests : [],
		userMap
	};

	if (req.query.pjax) {
		return res.render(req.directory + '/partials/requests.ejs', {
			bundle,
			lang: req.lang,
			moment
		});
	}

	res.render(req.directory + '/notifications.ejs', {
		moment,
		selection: 1,
		bundle,
		cdnURL: config.CDN_domain,
		lang: req.lang,
		pid: req.pid,
		template: 'requests',
		moderator: req.moderator
	});
});

export default router;

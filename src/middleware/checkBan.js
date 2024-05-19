const config = require('../../config.json');
const moment = require('moment/moment');
const db = require('../database');

async function checkBan(request, response, next) {
	if (!request.user && !request.guest_access && request.path !== '/login') {
		return response.status(401).send('Ban Check Failed: No user or guest access');
	} else if (!request.user && (request.guest_access || request.path === '/login')) {
		return next();
	}

	if (config.server_environment !== 'prod' && request.user.serverAccessLevel !== 'test' && request.user.serverAccessLevel !== 'dev') {
		response.status(500);
		if (request.directory === 'web') {
			return response.render('web/login.ejs', {toast: 'No access. Must be tester or dev', cdnURL: config.CDN_domain,});
		} else {
			return response.render('portal/partials/ban_notification.ejs', {
				user: null,
				error: 'No access. Must be tester or dev'
			});
		}
	}
	// Set moderator status
	request.moderator = request.user.accessLevel == 2 || request.user.accessLevel == 3;
	const user = await db.getUserSettings(request.pid);
	if (user && moment(user.ban_lift_date) <= moment() && user.account_status !== 3) {
		user.account_status = 0;
		await user.save();
	}
	// This includes ban checks for both Juxt specifically and the account server, ideally this should be squashed
	// assuming we support more gradual bans on PNID's
	if (user && (user.account_status < 0 || user.account_status > 1 || request.user.accessLevel < 0)) {
		if (request.directory === 'web') {
			let banMessage = '';
			switch (user.account_status) {
				case 2:
					banMessage = `${request.user.username} has been banned until: ${ moment(user.ban_lift_date) }. \n\nReason: ${user.ban_reason}. \n\nIf you have any questions contact the developers in the Discord server.`;
					break;
				case 3:
					banMessage = `${request.user.username} has been banned forever. \n\nReason: ${user.ban_reason}. \n\nIf you have any questions contact the developers in the Discord server.`;
					break;
				default:
					banMessage = `${request.user.username} has been banned. \n\nIf you have any questions contact the developers in the Discord server.`;
			}
			return response.render('web/login.ejs', {toast: banMessage, cdnURL: config.CDN_domain,});
		} else {
			return response.render(request.directory + '/partials/ban_notification.ejs', {
				user: user,
				moment: moment,
				cdnURL: config.CDN_domain,
				lang: request.lang,
				pid: request.pid,
				PNID: request.user.username,
				networkBan: request.user.accessLevel < 0
			});
		}
	}
	next();
}

module.exports = checkBan;
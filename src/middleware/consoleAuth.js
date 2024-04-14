/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable require-atomic-updates */
const config = require('../../config.json');
const util = require('../util');

async function auth(request, response, next) {
	// Get pid and fetch user data
	request.pid = request.headers['x-nintendo-servicetoken'] ? await util.data.processServiceToken(request.headers['x-nintendo-servicetoken']) : null;
	request.user = request.pid ? await util.data.getUserDataFromPid(request.pid) : null;

	// Set headers
	request.paramPackData = request.headers['x-nintendo-parampack'] ? util.data.decodeParamPack(request.headers['x-nintendo-parampack']) : null;
	response.header('X-Nintendo-WhiteList', config.whitelist);

	// This section includes checks if a user is a developer and adds exceptions for these cases
	if (!request.pid) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Unable to parse service token. Are you using a Nintendo Network ID?'
		});
	}
	if (!request.user) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Unable to fetch user data. Please try again later.'
		});
	}
	if (request.user.accessLevel < 3 && !request.paramPackData) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Missing auth headers'
		});
	}
	const userAgent = request.headers['user-agent'];
	if (request.user.accessLevel < 3 && (request.cookies.access_token || (!userAgent.includes('Nintendo WiiU') && !userAgent.includes('Nintendo 3DS')))) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Invalid authentication method used.'
		});
	}

	request.lang = util.data.processLanguage(request.paramPackData);
	return next();
}

module.exports = auth;

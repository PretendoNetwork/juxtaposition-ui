/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const util = require('../util');

async function webAuth(request, response, next) {
	// Get pid and fetch user data

	if (request.session && request.session.user && request.session.pid && !request.isWrite) {
		request.user = request.session.user;
		request.pid = request.session.pid;
	} else {
		try {
			request.user = await util.getUserDataFromToken(request.cookies.access_token);
			request.pid = request.user.pid;

			request.session.user = request.user;
			request.session.pid = request.pid;
		} catch (e) {
			const domain = request.get('host').replace('juxt', '');
			response.clearCookie('access_token', {domain: domain, path: '/'});
			response.clearCookie('refresh_token', {domain: domain, path: '/'});
			response.clearCookie('token_type', {domain: domain, path: '/'});
			if (request.path === '/login') {
				request.lang = util.processLanguage();
				request.token = request.cookies.access_token;
				request.paramPackData = null;
				return next();
			}
		}
	}

	request.token = request.cookies.access_token;

	// Open access pages
	if (isStartOfPath(request.path, '/users/') ||
		(isStartOfPath(request.path, '/titles/') && request.path !== '/titles/show') ||
		(isStartOfPath(request.path, '/posts/') && !request.path.includes('/empathy'))) {
		if (!request.pid && request.guest_access) {
			request.pid = 1000000000;
			return next();
		} else if (!request.pid) {
			return response.redirect('/login');
		}
	}
	// Login endpoint
	if (request.path === '/login') {
		if (request.pid) {
			return response.redirect('/titles/show?src=login');
		}
		return next();
	}
	if (!request.pid) {
		return response.redirect('/login');
	}

	return next();
}

function isStartOfPath(path, value) {
	return path.indexOf(value) === 0;
}

BigInt.prototype['toJSON'] = function () {
	return this.toString();
};


module.exports = webAuth;

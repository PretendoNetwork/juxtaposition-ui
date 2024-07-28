import * as util from '@/util';
import type { User } from '@/types/common/user';
import type { Request, Response, NextFunction } from 'express';
import config from '../../config.json';

export async function auth(request: Request, response: Response, next: NextFunction): Promise<void> {

	let pid: number | null;
	let user: User | null;

	// Get pid and fetch user data
	if (request.session && request.session.user && request.session.pid && !request.isWrite) {
		user = request.session.user;
		pid = request.session.pid;
	} else {
		pid = request.get('x-nintendo-servicetoken') ? await util.processServiceToken(request.get('x-nintendo-servicetoken')) : null;
		user = pid ? await util.getUserDataFromPid(pid) : null;

		request.session.user = user;
		request.session.pid = pid;
	}

	// Set headers
	const encodedParamPack = request.get('x-nintendo-parampack');
	request.paramPackData = encodedParamPack ? util.decodeParamPack(encodedParamPack) : null;
	response.header('X-Nintendo-WhiteList', config.whitelist);

	if (!user) {
		try {
			request.user = await util.getUserDataFromToken(request.cookies.access_token);
			request.pid = request.user.pid;
			if (request.user.accessLevel !== 3) {
				user = null;
				pid = null;
			}
		} catch (e) {
			console.log(e);
			user = null;
			pid = null;
		}
	}

	// This section includes checks if a user is a developer and adds exceptions for these cases
	if (!pid) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Unable to parse service token. Are you using a Nintendo Network ID?'
		});
	}
	request.pid = pid;

	if (!user) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Unable to fetch user data. Please try again later.'
		});
	}
	request.user = user;

	if (request.user.accessLevel < 3 && !request.paramPackData) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Missing auth headers'
		});
	}
	const userAgent = request.get('user-agent');
	if (request.user.accessLevel < 3 && (request.cookies.access_token || (!userAgent?.includes('Nintendo WiiU') && !userAgent?.includes('Nintendo 3DS')))) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Invalid authentication method used.'
		});
	}

	request.lang = util.processLanguage(request?.paramPackData ?? undefined);
	//console.timeEnd(`Time Request ${request.timerDate}`);
	return next();
}
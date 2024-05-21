import util from '../util';
import { Request, Response, NextFunction } from 'express';

export async function detectVersion(request: Request, response: Response, next: NextFunction): Promise<void> {
	request.timerDate = Date.now();
	console.time(`Time Request ${request.timerDate}`);
	// Check the domain and set the directory
	if (includes(request, 'juxt')) {
		request.directory = 'web';
		request.lang = util.processLanguage();
	} else {
		request.directory = includes(request, 'portal') ? 'portal' : 'ctr';
	}

	request.isWrite = request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE';

	next();
}

function includes(request: Request, domain: string): boolean {
	return request.subdomains.findIndex(element => element.includes(domain)) !== -1;
}

export default {
	detectVersion
};

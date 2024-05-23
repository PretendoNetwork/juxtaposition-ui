import * as util from '@/util';
import type { Request, Response, NextFunction } from 'express';

export async function staticFiles(request: Request, response: Response, next: NextFunction): Promise<void> {
	// Web files
	if (isStartOfPath(request.path, '/css/') ||
        isStartOfPath(request.path, '/fonts/') ||
        isStartOfPath(request.path, '/js/') ||
        request.path === '/favicon.ico' ||
        isStartOfPath(request.path, '/web/')  ||
        isStartOfPath(request.path, '/images/')  ||
        isStartOfPath(request.path, '/image/')) {

		request.lang = util.processLanguage();

		if (request.subdomains.includes('juxt')) {
			request.directory = 'web';
		} else {
			request.directory = request.subdomains[1];
		}
		return next();
	} else if (request.path === '/') {
		return response.redirect('/titles/show');
	} else {
		response.sendStatus(404);
		return;
	}
}

function isStartOfPath(path: string, value: string): boolean {
	return path.indexOf(value) === 0;
}
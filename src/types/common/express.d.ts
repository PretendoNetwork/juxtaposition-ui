import translations from '../../translations';

declare global {
	namespace Express {
		interface Request {
			timerDate: number;
			directory: string;
			lang: typeof translations.EN;
			isWrite: boolean;
		}
	}
}
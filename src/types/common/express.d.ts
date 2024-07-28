import type translations from '../../translations';
import type { ParamPack } from './param-pack';
import type { User } from './user';

declare global {

	namespace Express {

		interface Request {
			timerDate: number;
			directory: string;
			lang: typeof translations.EN;
			isWrite: boolean;
			guest_access: boolean;
			new_users: boolean;
			pid: number;
			user: User;
			token: string;
			paramPackData: ParamPack | null;
			moderator: boolean;
		}
	}
}
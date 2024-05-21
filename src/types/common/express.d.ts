import translations from '../../translations';
import { ParamPack } from './param-pack';
import { User } from './user';

declare global {

	namespace Express {

		interface Request {
			timerDate: number;
			directory: string;
			lang: typeof translations.EN;
			isWrite: boolean;
			guest_access: boolean;
			new_users: boolean;
			pid: number | null;
			user: User | null;
			token: string;
			paramPackData: ParamPack | null;
			moderator: boolean;
		}
	}
}
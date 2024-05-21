import { GetUserDataResponse as ApiGetUserDataResponse } from '@pretendonetwork/grpc/api/get_user_data_rpc';
import { GetUserDataResponse as AccountGetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import translations from '../../translations';
import { ParamPack } from './param-pack';

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
			user: ApiGetUserDataResponse | AccountGetUserDataResponse | null;
			token: string;
			paramPackData: ParamPack | null;
		}
	}
}
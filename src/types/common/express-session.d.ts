import { GetUserDataResponse as ApiGetUserDataResponse } from '@pretendonetwork/grpc/api/get_user_data_rpc';
import { GetUserDataResponse as AccountGetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';

declare module 'express-session' {

    interface SessionData {
        pid: number | null;
        user: ApiGetUserDataResponse | AccountGetUserDataResponse | null;
    }
}
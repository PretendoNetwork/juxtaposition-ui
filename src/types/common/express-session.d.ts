import { GetUserDataResponse } from '@pretendonetwork/grpc/api/get_user_data_rpc';

declare module 'express-session' {

    interface SessionData {
        pid: number;
        user: GetUserDataResponse;
    }
}
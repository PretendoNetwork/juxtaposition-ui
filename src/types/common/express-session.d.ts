import { User } from './user';

declare module 'express-session' {

	interface SessionData {
		pid: number | null;
		user: User | null;
	}
}
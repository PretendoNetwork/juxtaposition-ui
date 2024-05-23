import { Mii } from '@pretendonetwork/grpc/api/mii';

export interface User {
	deleted: boolean;
	creationDate: string;
	pid: number;
	username: string;
	accessLevel: number;
	serverAccessLevel: string;
	mii: Mii | undefined;
	gender: string;
	country: string;
	language: string;
	emailAddress: string;
}
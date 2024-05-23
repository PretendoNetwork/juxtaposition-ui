import { Model, HydratedDocument } from 'mongoose';

export interface IEndpoint {
	status: number;
	server_access_level: string;
	topics: boolean;
	guest_access: boolean;
	new_users: boolean;
	host: string;
	api_host: string;
	portal_host: string;
	n3ds_host: string;
}

export type EndpointModel = Model<IEndpoint, object>;

export type HydratedEndpointDocument = HydratedDocument<IEndpoint>;
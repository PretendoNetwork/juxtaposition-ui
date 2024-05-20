import { EndpointModel, IEndpoint } from '@/types/mongoose/endpoint';
import { Schema, model } from 'mongoose';

export const endpointSchema = new Schema<IEndpoint, EndpointModel>({
	status: Number,
	server_access_level: String,
	topics: Boolean,
	guest_access: Boolean,
	new_users: {
		type: Boolean,
		default: true,
	},
	host: String,
	api_host: String,
	portal_host: String,
	n3ds_host: String,
});

export const ENDPOINT = model<IEndpoint, EndpointModel>('ENDPOINT', endpointSchema);
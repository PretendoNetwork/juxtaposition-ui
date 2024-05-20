import { CommunityModel, HydratedCommunityDocument, ICommunity, ICommunityMethods, IPermissions, PermissionsModel } from '@/types/mongoose/communities';
import { Schema, model } from 'mongoose';

export const PermissionsSchema = new Schema<IPermissions, PermissionsModel>({
	open: {
		type: Boolean,
		default: true
	},
	minimum_new_post_access_level: {
		type: Number,
		default: 0
	},
	minimum_new_comment_access_level: {
		type: Number,
		default: 0
	},
	minimum_new_community_access_level: {
		type: Number,
		default: 0
	},
});

export const CommunitySchema = new Schema<ICommunity, CommunityModel, ICommunityMethods>({
	platform_id: Number,
	name: String,
	description: String,
	/**
     * 0: Main Community
     * 1: Sub-Community
     * 2: Announcement Community
     * 3: Private Community
     */
	type: {
		type: Number,
		default: 0
	},
	parent: {
		type: String,
		default: null
	},
	admins: {
		type: [Number],
		default: undefined
	},
	created_at: {
		type: Date,
		default: new Date(),
	},
	empathy_count: {
		type: Number,
		default: 0
	},
	followers: {
		type: Number,
		default: 0
	},
	has_shop_page: {
		type: Number,
		default: 0
	},
	icon: String,
	title_ids: {
		type: [String],
		default: undefined
	},
	title_id: {
		type: [String],
		default: undefined
	},
	community_id: String,
	olive_community_id: String,
	is_recommended: {
		type: Number,
		default: 0
	},
	app_data: String,
	permissions: PermissionsSchema,
});

CommunitySchema.method<HydratedCommunityDocument>('upEmpathy', async function() {
	const empathy = this.get('empathy_count');
	this.set('empathy_count', empathy + 1);

	await this.save();
});

CommunitySchema.method<HydratedCommunityDocument>('downEmpathy', async function(): Promise<void> {
	const empathy = this.get('empathy_count');
	this.set('empathy_count', empathy - 1);

	await this.save();
});

CommunitySchema.method<HydratedCommunityDocument>('upFollower', async function(): Promise<void> {
	const followers = this.get('followers');
	this.set('followers', followers + 1);

	await this.save();
});

CommunitySchema.method<HydratedCommunityDocument>('downFollower', async function(): Promise<void> {
	const followers = this.get('followers');
	this.set('followers', followers - 1);

	await this.save();
});

export const COMMUNITY = model<ICommunity, CommunityModel>('COMMUNITY', CommunitySchema);
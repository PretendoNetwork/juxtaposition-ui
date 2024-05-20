import { Model, Types, HydratedDocument } from 'mongoose';

export interface IPermissions {
	open: boolean,
	minimum_new_post_access_level: number,
	minimum_new_comment_access_level: number,
	minimum_new_community_access_level: number
}

export type PermissionsModel = Model<IPermissions, object>;

enum COMMUNITY_TYPE {
	Main = 0,
	Sub = 1,
	Announcement = 2,
	Private = 3
}

export interface ICommunity {
	platform_id: number;
	name: string;
	description: string;
	type: COMMUNITY_TYPE;
	parent: string;
	admins: Types.Array<number>;
	created_at: Date;
	empathy_count: number;
	followers: number;
	has_shop_page: number;
	icon: string;
	title_ids: Types.Array<string>;
	title_id: Types.Array<string>;
	community_id: string;
	olive_community_id: string;
	is_recommended: number;
	app_data: string;
	permissions: IPermissions;
}

export interface ICommunityMethods {
	upEmpathy(): Promise<void>;
	downEmpathy(): Promise<void>;
	upFollower(): Promise<void>;
	downFollower(): Promise<void>;
}

export type CommunityModel = Model<ICommunity, object, ICommunityMethods>;

export type HydratedCommunityDocument = HydratedDocument<ICommunity, ICommunityMethods>;
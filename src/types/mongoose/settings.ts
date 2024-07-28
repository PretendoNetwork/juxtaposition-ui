import type { Model, HydratedDocument } from 'mongoose';

export interface ISettings {
	pid: number;
	screen_name: string;
	account_status: number;
	ban_lift_date: Date;
	ban_reason: string;
	profile_comment: string;
	profile_comment_visibility: boolean;
	game_skill: number;
	game_skill_visibility: boolean;
	birthday_visibility: boolean;
	relationship_visibility: boolean;
	country_visibility: boolean;
	profile_favorite_community_visibility: boolean;
	receive_notifications: boolean;
	created_at: Date;
}

export interface ISettingsMethods {
	updateComment(comment: string): Promise<void>;
	updateSkill(skill: number): Promise<void>;
	commentVisible(active: boolean): Promise<void>;
	skillVisible(active: boolean): Promise<void>;
	birthdayVisible(active: boolean): Promise<void>;
	relationshipVisible(active: boolean): Promise<void>;
	countryVisible(active: boolean): Promise<void>;
	favCommunityVisible(active: boolean): Promise<void>;
}

export type SettingsModel = Model<ISettings, object, ISettingsMethods>;

export type HydratedSettingsDocument = HydratedDocument<ISettings, ISettingsMethods>;
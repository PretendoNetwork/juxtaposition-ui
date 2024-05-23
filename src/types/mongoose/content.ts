import { Model, Types, HydratedDocument } from 'mongoose';

export interface IContent {
	pid: number;
	followed_communities: Types.Array<string>;
	followed_users: Types.Array<number>;
	following_users: Types.Array<number>;
}

export interface IContentMethods {
	addToCommunities(postID: string): Promise<void>;
	removeFromCommunities(postID: string): Promise<void>;
	addToUsers(postID: number): Promise<void>;
	removeFromUsers(postID: number): Promise<void>;
	addToFollowers(postID: number): Promise<void>;
	removeFromFollowers(postID: number): Promise<void>;
}

export type ContentModel = Model<IContent, object, IContentMethods>;

export type HydratedContentDocument = HydratedDocument<IContent, IContentMethods>;
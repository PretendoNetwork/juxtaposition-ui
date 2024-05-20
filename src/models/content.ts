import { ContentModel, HydratedContentDocument, IContent, IContentMethods } from '@/types/mongoose/content';
import { Schema, model } from 'mongoose';

export const ContentSchema = new Schema<IContent, ContentModel, IContentMethods>({
	pid: Number,
	followed_communities: {
		type: [String],
		default: [0]
	},
	followed_users: {
		type: [Number],
		default: [0]
	},
	following_users: {
		type: [Number],
		default: [0]
	},
});

ContentSchema.method<HydratedContentDocument>('addToCommunities', async function(postID: string) {
	const communities = this.get('followed_communities');
	communities.addToSet(postID);
	await this.save();
});

ContentSchema.method<HydratedContentDocument>('removeFromCommunities', async function(postID: string): Promise<void> {
	const communities = this.get('followed_communities');
	communities.pull(postID);
	await this.save();
});

ContentSchema.method<HydratedContentDocument>('addToUsers', async function(postID: string): Promise<void> {
	const users = this.get('followed_users');
	users.addToSet(postID);
	await this.save();
});

ContentSchema.method<HydratedContentDocument>('removeFromUsers', async function(postID: string): Promise<void> {
	const users = this.get('followed_users');
	users.pull(postID);
	await this.save();
});

ContentSchema.method<HydratedContentDocument>('addToFollowers', async function(postID: string): Promise<void> {
	const users = this.get('following_users');
	users.addToSet(postID);
	await this.save();
});

ContentSchema.method<HydratedContentDocument>('removeFromFollowers', async function(postID: string): Promise<void> {
	const users = this.get('following_users');
	users.pull(postID);
	await this.save();
});

export const CONTENT = model<IContent, ContentModel>('CONTENT', ContentSchema);
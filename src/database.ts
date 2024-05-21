import { set, connect as _connect, connection as _connection, Connection } from 'mongoose';
import { FuzzySearch } from 'mongoose-fuzzy-search-next';
import { mongoose as mongooseConfig } from '../config.json';
import { COMMUNITY } from './models/communities';
import { CONTENT } from './models/content';
import { CONVERSATION } from './models/conversation';
import { ENDPOINT } from './models/endpoint';
import { NOTIFICATION } from './models/notifications';
import { POST } from './models/post';
import { SETTINGS } from './models/settings';
import { REPORT } from './models/report';

const { uri, database, options } = mongooseConfig;
import { info } from './logger';
import { HydratedCommunityDocument, ICommunity } from './types/mongoose/communities';
import { HydratedPostDocument, IPost } from './types/mongoose/post';
import { HydratedEndpointDocument } from './types/mongoose/endpoint';
import { HydratedSettingsDocument } from './types/mongoose/settings';
import { HydratedContentDocument, IContent } from './types/mongoose/content';
import { HydratedConversationDocument } from './types/mongoose/conversation';
import { HydratedNotificationDocument } from './types/mongoose/notifications';
import { HydratedReportDocument } from './types/mongoose/report';

let connection: Connection;
set('strictQuery', true);

export async function connect(): Promise<void> {
	await _connect(`${uri}/${database}`, options);
	connection = _connection;
	connection.on('connected', function (this: Connection) {
		info(`MongoDB connected ${this.name}`);
	});
	// Should this use the logger?
	connection.on('error', console.error.bind(console, 'connection error:'));
	connection.on('close', () => {
		connection.removeAllListeners();
	});
}

function verifyConnected(): void {
	if (!connection) {
		connect();
	}
}

export async function getCommunities(numberOfCommunities: number): Promise<HydratedCommunityDocument[]> {
	verifyConnected();

	if (numberOfCommunities === -1) {
		return COMMUNITY.find({ parent: null, type: [0,2] });
	} else {
		return COMMUNITY.find({ parent: null, type: [0,2] }).limit(numberOfCommunities);
	}
}

export async function getMostPopularCommunities(numberOfCommunities: number): Promise<HydratedCommunityDocument[]> {
	verifyConnected();

	return COMMUNITY.find({ parent: null, type: 0 }).sort({followers: -1}).limit(numberOfCommunities);
}

export async function getNewCommunities(numberOfCommunities: number): Promise<HydratedCommunityDocument[]> {
	verifyConnected();

	return COMMUNITY.find({ parent: null, type: 0 }).sort([['created_at', -1]]).limit(numberOfCommunities);
}

export async function getSubCommunities(communityID: string): Promise<HydratedCommunityDocument[]> {
	verifyConnected();

	return COMMUNITY.find({
		parent: communityID
	});
}

export async function getCommunityByTitleID(title_id: string): Promise<HydratedCommunityDocument | null> {
	verifyConnected();

	return COMMUNITY.findOne({
		title_id: title_id
	});
}

export async function getCommunityByID(community_id: string): Promise<HydratedCommunityDocument | null> {
	verifyConnected();

	return COMMUNITY.findOne({
		olive_community_id: community_id
	});
}

export async function getTotalPostsByCommunity(community: ICommunity): Promise<number> {
	verifyConnected();

	return POST.find({
		community_id: community.olive_community_id,
		parent: null,
		removed: false
	}).countDocuments();
}

export async function getPostByID(postID: number): Promise<HydratedPostDocument | null> {
	verifyConnected();

	return POST.findOne({
		id: postID
	});
}

export async function getPostsByUserID(userID: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		pid: userID,
		parent: null,
		removed: false
	});
}

export async function getPostReplies(postID: number, number: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		parent: postID,
		removed: false
	}).limit(number);
}

export async function getDuplicatePosts(pid: number, post: IPost): Promise<HydratedPostDocument | null> {
	verifyConnected();

	return POST.findOne({
		pid: pid,
		body: post.body,
		painting: post.painting,
		screenshot: post.screenshot,
		parent: null,
		removed: false
	});
}

export async function getUserPostRepliesAfterTimestamp(post: IPost, numberOfPosts: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		parent: post.pid,
		created_at: { $lt: post.created_at },
		message_to_pid: null,
		removed: false
	}).limit(numberOfPosts);
}

export async function getNumberUserPostsByID(userID: number, number: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		pid: userID,
		parent: null,
		message_to_pid: null,
		removed: false
	}).sort({ created_at: -1}).limit(number);
}

export async function getTotalPostsByUserID(userID: number): Promise<number> {
	verifyConnected();

	return POST.find({
		pid: userID,
		parent: null,
		message_to_pid: null,
		removed: false
	}).countDocuments();
}

export async function getHotPostsByCommunity(community: ICommunity, numberOfPosts: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		community_id: community.olive_community_id,
		parent: null,
		removed: false
	}).sort({empathy_count: -1}).limit(numberOfPosts);
}

export async function getNumberNewCommunityPostsByID(community: ICommunity, number: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		community_id: community.olive_community_id,
		parent: null,
		removed: false
	}).sort({ created_at: -1}).limit(number);
}

export async function getNumberPopularCommunityPostsByID(community: ICommunity, limit: number, offset: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		community_id: community.olive_community_id,
		parent: null,
		removed: false
	}).sort({ empathy_count: -1}).skip(offset).limit(limit);
}

export async function getNumberVerifiedCommunityPostsByID(community: ICommunity, limit: number, offset: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		community_id: community.olive_community_id,
		verified: true,
		parent: null,
		removed: false
	}).sort({ created_at: -1}).skip(offset).limit(limit);
}

export async function getPostsByCommunity(community: ICommunity, numberOfPosts: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		community_id: community.olive_community_id,
		parent: null,
		removed: false
	}).limit(numberOfPosts);
}

export async function getPostsByCommunityKey(community: ICommunity, numberOfPosts: number, search_key: string): Promise<HydratedPostDocument[]> {
	verifyConnected();
	
	return POST.find({
		community_id: community.olive_community_id,
		search_key: search_key,
		parent: null,
		removed: false
	}).limit(numberOfPosts);
}

export async function getNewPostsByCommunity(community: ICommunity, limit: number, offset: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		community_id: community.olive_community_id,
		parent: null,
		removed: false
	}).sort({ created_at: -1 }).skip(offset).limit(limit);
}

export async function getAllUserPosts(pid: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		pid: pid,
		message_to_pid: null
	});
}

export async function getRemovedUserPosts(pid: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		pid: pid,
		message_to_pid: null,
		removed: true
	});
}

export async function getUserPostsAfterTimestamp(post: IPost, numberOfPosts: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		pid: post.pid,
		created_at: { $lt: post.created_at },
		parent: null,
		message_to_pid: null,
		removed: false
	}).limit(numberOfPosts);
}

export async function getUserPostsOffset(pid: number, limit: number, offset: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		pid: pid,
		parent: null,
		message_to_pid: null,
		removed: false
	}).skip(offset).limit(limit).sort({ created_at: -1});
}

export async function getCommunityPostsAfterTimestamp(post: IPost, numberOfPosts: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		community_id: post.community_id,
		created_at: { $lt: post.created_at },
		parent: null,
		removed: false
	}).limit(numberOfPosts);
}

export async function getEndpoints(): Promise<HydratedEndpointDocument[]> {
	verifyConnected();

	return ENDPOINT.find({});
}

export async function getEndPoint(accessLevel: string): Promise<HydratedEndpointDocument | null> {
	verifyConnected();

	return ENDPOINT.findOne({
		server_access_level: accessLevel
	});
}

export async function getUsersSettings(numberOfUsers: number): Promise<HydratedSettingsDocument[]> {
	verifyConnected();

	if (numberOfUsers === -1) {
		return SETTINGS.find({});
	} else {
		return SETTINGS.find({}).limit(numberOfUsers);
	}
}

export async function getUsersContent(numberOfUsers: number, offset: number): Promise<HydratedSettingsDocument[]> {
	verifyConnected();

	if (numberOfUsers === -1) {
		return SETTINGS.find({}).skip(offset);
	} else {
		return SETTINGS.find({}).skip(offset).limit(numberOfUsers);
	}
}

export async function getUserSettingsFuzzySearch(search_key: string, numberOfUsers: number, offset: number): Promise<HydratedSettingsDocument[]> {
	verifyConnected();

	if (numberOfUsers === -1) {
		return SETTINGS.find(FuzzySearch(['screen_name'], search_key)).skip(offset);
	} else {
		return SETTINGS.find(FuzzySearch(['screen_name'], search_key)).skip(offset).limit(numberOfUsers);
	}
}

export async function getUserSettings(pid: number | null): Promise<HydratedSettingsDocument | null> {
	if (!pid) {
		return null;
	}

	verifyConnected();

	return SETTINGS.findOne({pid: pid});
}

export async function getUserContent(pid: number): Promise<HydratedContentDocument | null> {
	verifyConnected();

	return CONTENT.findOne({pid: pid});
}

export async function getFollowingUsers(content: IContent): Promise<HydratedSettingsDocument[]> {
	verifyConnected();

	return SETTINGS.find({
		pid: content.following_users
	});
}

export async function getFollowedUsers(content: IContent): Promise<HydratedSettingsDocument[]> {
	verifyConnected();
	
	return SETTINGS.find({
		pid: content.followed_users
	});
}

export async function getNewsFeed(content: IContent, numberOfPosts: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		$or: [
			{ pid: content.followed_users },
			{ pid: content.pid },
			{ community_id: content.followed_communities },
		],
		parent: null,
		message_to_pid: null,
		removed: false
	}).limit(numberOfPosts).sort({ created_at: -1});
}

export async function getNewsFeedAfterTimestamp(content: IContent, numberOfPosts: number, post: IPost): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		$or: [
			{pid: content.followed_users},
			{pid: content.pid},
			{community_id: content.followed_communities},
		],
		created_at: { $lt: post.created_at },
		parent: null,
		message_to_pid: null,
		removed: false
	}).limit(numberOfPosts).sort({ created_at: -1});
}

export async function getNewsFeedOffset(content: IContent, limit: number, offset: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		$or: [
			{pid: content.followed_users},
			{pid: content.pid},
			{community_id: content.followed_communities},
		],
		parent: null,
		message_to_pid: null,
		removed: false
	}).skip(offset).limit(limit).sort({ created_at: -1});
}

export async function getConversations(pid: number): Promise<HydratedConversationDocument[]> {
	verifyConnected();

	return CONVERSATION.find({
		'users.pid': pid
	}).sort({ last_updated: -1});
}

export async function getUnreadConversationCount(pid: number): Promise<number> {
	verifyConnected();

	return CONVERSATION.find({
		'users': { $elemMatch: {
			'pid': pid,
			'read': false
		}}

	}).countDocuments();
}

export async function getConversationByID(community_id: number): Promise<HydratedConversationDocument | null> {
	verifyConnected();

	return CONVERSATION.findOne({
		type: 3,
		id: community_id
	});
}

export async function getConversationMessages(community_id: number, limit: number, offset: number): Promise<HydratedPostDocument[]> {
	verifyConnected();

	return POST.find({
		community_id: community_id,
		parent: null,
		removed: false
	}).sort({created_at: 1}).skip(offset).limit(limit);
}

export async function getConversationByUsers(pids: number[]): Promise<HydratedConversationDocument | null> {
	verifyConnected();

	return CONVERSATION.findOne({
		$and: [
			{'users.pid': pids[0]},
			{'users.pid': pids[1]}
		]
	});
}

export async function getLatestMessage(pid: number, pid2: number): Promise<HydratedConversationDocument | null> {
	verifyConnected();

	return POST.findOne({
		$or: [
			{pid: pid, message_to_pid: pid2},
			{pid: pid2, message_to_pid: pid}
		],
		removed: false
	});
}

export async function getNotifications(pid: number, limit: number, offset: number): Promise<HydratedNotificationDocument[]> {
	verifyConnected();

	return NOTIFICATION.find({
		pid: pid,
	}).sort({lastUpdated: -1}).skip(offset).limit(limit);
}

export async function getNotification(pid: string, type: string, reference_id: number): Promise<HydratedNotificationDocument | null> {
	verifyConnected();

	return NOTIFICATION.findOne({
		pid: pid,
		type: type,
		reference_id: reference_id
	});
}

export async function getLastNotification(pid: number): Promise<HydratedNotificationDocument | null> {
	verifyConnected();

	return NOTIFICATION.findOne({
		pid: pid
	}).sort({lastUpdated: -1}).limit(1);
}

export async function getUnreadNotificationCount(pid: number): Promise<number> {
	verifyConnected();

	return NOTIFICATION.find({
		pid: pid,
		read: false
	}).countDocuments();
}

export async function getAllReports(offset: number, limit: number): Promise<HydratedReportDocument[]> {
	verifyConnected();

	return REPORT.find().sort({created_at: -1}).skip(offset).limit(limit);
}

export async function getAllOpenReports(offset: number, limit: number): Promise<HydratedReportDocument[]> {
	verifyConnected();

	return REPORT.find({ resolved: false }).sort({created_at: -1}).skip(offset).limit(limit);
}

export async function getReportsByUser(pid: number, offset: number, limit: number): Promise<HydratedReportDocument[]> {
	verifyConnected();

	return REPORT.find({ reported_by: pid }).sort({created_at: -1}).skip(offset).limit(limit);
}

export async function getReportsByPost(postID: number, offset: number, limit: number): Promise<HydratedReportDocument[]> {
	verifyConnected();

	return REPORT.find({ post_id: postID }).sort({created_at: -1}).skip(offset).limit(limit);
}

export async function getDuplicateReports(pid: number, postID: number): Promise<HydratedReportDocument | null> {
	verifyConnected();
	return REPORT.findOne({
		reported_by: pid,
		post_id: postID
	});
}

export async function getReportById(id: number): Promise<HydratedReportDocument | null> {
	verifyConnected();

	return REPORT.findById(id);
}

export default {
	connect,
	getCommunities,
	getMostPopularCommunities,
	getNewCommunities,
	getSubCommunities,
	getCommunityByTitleID,
	getCommunityByID,
	getTotalPostsByCommunity,
	getPostsByCommunity,
	getHotPostsByCommunity,
	getNumberNewCommunityPostsByID,
	getNumberPopularCommunityPostsByID,
	getNumberVerifiedCommunityPostsByID,
	getNewPostsByCommunity,
	getPostsByCommunityKey,
	getPostsByUserID,
	getPostReplies,
	getUserPostRepliesAfterTimestamp,
	getNumberUserPostsByID,
	getTotalPostsByUserID,
	getPostByID,
	getDuplicatePosts,
	getEndpoints,
	getEndPoint,
	getUserPostsAfterTimestamp,
	getUserPostsOffset,
	getCommunityPostsAfterTimestamp,
	getNewsFeed,
	getNewsFeedAfterTimestamp,
	getNewsFeedOffset,
	getFollowingUsers,
	getFollowedUsers,
	getConversations,
	getConversationByID,
	getConversationByUsers,
	getConversationMessages,
	getUnreadConversationCount,
	getLatestMessage,
	getUsersSettings,
	getUsersContent,
	getUserSettings,
	getUserContent,
	getNotifications,
	getUnreadNotificationCount,
	getNotification,
	getLastNotification,
	getAllUserPosts,
	getRemovedUserPosts,
	getAllReports,
	getAllOpenReports,
	getReportsByUser,
	getReportsByPost,
	getReportById
};
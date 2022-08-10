const mongoose = require('mongoose');
const { mongoose: mongooseConfig } = require('../config.json');
const { ENDPOINT } = require('./models/endpoint');
const { COMMUNITY } = require('./models/communities');
const { POST } = require('./models/post');
const { USER } = require('./models/user');
const { CONVERSATION } = require('./models/conversation');
const { uri, database, options } = mongooseConfig;
const { PNID } = require('./models/pnid');
const logger = require('./logger');
const accountDB = require('./accountdb');

let connection;

async function connect() {
    await mongoose.connect(`${uri}/${database}`, options);
    connection = mongoose.connection;
    connection.on('connected', function () {
        logger.info(`MongoDB connected ${this.name}`);
    });
    connection.on('error', console.error.bind(console, 'connection error:'));
    connection.on('close', () => {
        connection.removeAllListeners();
    });
}

function verifyConnected() {
    if (!connection) {
        connect();
    }
}

async function getCommunities(numberOfCommunities) {
    verifyConnected();
    if(numberOfCommunities === -1)
        return COMMUNITY.find({ parent: null, type: 0 });
    else
        return COMMUNITY.find({ parent: null, type: 0 }).limit(numberOfCommunities);
}

async function getMostPopularCommunities(numberOfCommunities) {
    verifyConnected();
    return COMMUNITY.find({ parent: null, type: 0 }).sort({followers: -1}).limit(numberOfCommunities);
}

async function getNewCommunities(numberOfCommunities) {
    verifyConnected();
    return COMMUNITY.find({ parent: null, type: 0 }).sort([['created_at', -1]]).limit(numberOfCommunities);
}

async function getSubCommunities(communityID) {
    verifyConnected();
    return COMMUNITY.find({
        parent: communityID
    });
}

async function getCommunityByTitleID(title_id) {
    verifyConnected();
    return COMMUNITY.findOne({
        title_id: title_id
    });
}

async function getCommunityByID(community_id) {
    verifyConnected();
    return COMMUNITY.findOne({
        community_id: community_id
    });
}

async function getTotalPostsByCommunity(community) {
    verifyConnected();
    return POST.find({
        title_id: community.title_id,
        parent: null
    }).countDocuments();
}

async function getPostByID(postID) {
    verifyConnected();

    return POST.findOne({
        id: postID
    });
}

async function getPostsByUserID(userID) {
    verifyConnected();
    return POST.find({
        pid: userID,
        parent: null
    });
}

async function getPostReplies(postID, number) {
    verifyConnected();
    return POST.find({
        parent: postID
    }).limit(number);
}

async function getDuplicatePosts(pid, post) {
    verifyConnected();
    return POST.findOne({
        pid: pid,
        body: post.body,
        painting: post.painting,
        screenshot: post.screenshot,
        parent: null
    });
}

async function getUserPostRepliesAfterTimestamp(post, numberOfPosts) {
    verifyConnected();
    return POST.find({
        parent: post.pid,
        created_at: { $lt: post.created_at },
        message_to_pid: null
    }).limit(numberOfPosts);
}

async function getNumberUserPostsByID(userID, number) {
    verifyConnected();
    return POST.find({
        pid: userID,
        parent: null,
        message_to_pid: null
    }).sort({ created_at: -1}).limit(number);
}

async function getTotalPostsByUserID(userID) {
    verifyConnected();
    return POST.find({
        pid: userID,
        parent: null,
        message_to_pid: null
    }).countDocuments();
}

async function getHotPostsByCommunity(community, numberOfPosts) {
    verifyConnected();
    return POST.find({
        title_id: community.title_id,
        parent: null
    }).sort({empathy_count: -1}).limit(numberOfPosts);
}

async function getNumberNewCommunityPostsByID(community, number) {
    verifyConnected();
    return POST.find({
        title_id: community.title_id,
        parent: null
    }).sort({ created_at: -1}).limit(number);
}

async function getNumberPopularCommunityPostsByID(community, limit, offset) {
    verifyConnected();
    return POST.find({
        title_id: community.title_id,
        parent: null
    }).sort({ empathy_count: -1}).skip(offset).limit(limit);
}

async function getNumberVerifiedCommunityPostsByID(community, limit, offset) {
    verifyConnected();
    return POST.find({
        title_id: community.title_id,
        verified: true,
        parent: null
    }).sort({ created_at: -1}).skip(offset).limit(limit);
}

async function getPostsByCommunity(community, numberOfPosts) {
    verifyConnected();
    return POST.find({
        title_id: community.title_id,
        parent: null
    }).limit(numberOfPosts);
}

async function getPostsByCommunityKey(community, numberOfPosts, search_key) {
    verifyConnected();
    return POST.find({
        title_id: community.title_id,
        search_key: search_key,
        parent: null
    }).limit(numberOfPosts);
}

async function getNewPostsByCommunity(community, limit, offset) {
    verifyConnected();
    return POST.find({
        community_id: community.community_id,
        parent: null
    }).sort({ created_at: -1 }).skip(offset).limit(limit);
}

async function getUserPostsAfterTimestamp(post, numberOfPosts) {
    verifyConnected();
    return POST.find({
        pid: post.pid,
        created_at: { $lt: post.created_at },
        parent: null,
        message_to_pid: null,
    }).limit(numberOfPosts);
}

async function getUserPostsOffset(pid, limit, offset) {
    verifyConnected();
    return POST.find({
        pid: pid,
        parent: null,
        message_to_pid: null
    }).skip(offset).limit(limit).sort({ created_at: -1});
}

async function getCommunityPostsAfterTimestamp(post, numberOfPosts) {
    verifyConnected();
    return POST.find({
        title_id: post.title_id,
        created_at: { $lt: post.created_at },
        parent: null
    }).limit(numberOfPosts);
}

async function pushNewNotificationByPID(PID, content, link) {
    verifyConnected();
    return USER.update(
        { pid: PID }, { $push: { notification_list: { content: content, link: link, read: false, created_at: Date() }}});
}

async function pushNewNotificationToAll(content, link) {
    verifyConnected();
    return USER.updateMany(
        {}, { $push: { notification_list: { content: content, link: link, read: false, created_at: Date() }}});
}

async function getDiscoveryHosts() {
    verifyConnected();
    return ENDPOINT.findOne({
        version: 1
    });
}

async function getUsers(numberOfUsers) {
    verifyConnected();
    if(numberOfUsers === -1)
        return USER.find({});
    else
        return USER.find({}).limit(numberOfUsers);
}

async function getFollowingUsers(user) {
    verifyConnected();
    return USER.find({
        pid: user.following_users
    });
}

async function getFollowedUsers(user) {
    verifyConnected();
    return USER.find({
        pid: user.followed_users
    });
}

async function getUserByPID(PID) {
    verifyConnected();

    return USER.findOne({
        pid: PID
    });
}

async function getUserByUsername(user_id) {
    verifyConnected();

    return USER.findOne({
        pnid: new RegExp(`^${user_id}$`, 'i')
    });
}

async function getServerConfig() {
    verifyConnected();
    return ENDPOINT.findOne();
}

async function getNewsFeed(user, numberOfPosts) {
    verifyConnected();
    return POST.find({
        $or: [
            {pid: user.followed_users},
            {pid: user.pid},
            {community_id: user.followed_communities},
        ],
        parent: null,
        message_to_pid: null
    }).limit(numberOfPosts).sort({ created_at: -1});
}

async function getNewsFeedAfterTimestamp(user, numberOfPosts, post) {
    verifyConnected();
    return POST.find({
        $or: [
            {pid: user.followed_users},
            {pid: user.pid},
            {community_id: user.followed_communities},
        ],
        created_at: { $lt: post.created_at },
        parent: null,
        message_to_pid: null
    }).limit(numberOfPosts).sort({ created_at: -1});
}

async function getNewsFeedOffset(user, limit, offset) {
    verifyConnected();
    return POST.find({
        $or: [
            {pid: user.followed_users},
            {pid: user.pid},
            {community_id: user.followed_communities},
        ],
        parent: null,
        message_to_pid: null
    }).skip(offset).limit(limit).sort({ created_at: -1});
}

async function getConversations(pid) {
    verifyConnected();
    return CONVERSATION.find({
        "users.pid": pid
    }).sort({ last_updated: -1});
}

async function getUnreadConversationCount(pid) {
    verifyConnected();
    return CONVERSATION.find({
        "users": { $elemMatch: {
                'pid': pid,
                'read': false
            }}

    }).countDocuments();
}

async function getConversationByID(community_id) {
    verifyConnected();
    return CONVERSATION.findOne({
        type: 3,
        id: community_id
    });
}

async function getConversationMessages(community_id, limit, offset) {
    verifyConnected();
    return POST.find({
        community_id: community_id,
        parent: null
    }).sort({created_at: 1}).skip(offset).limit(limit);
}

async function getConversationByUsers(pids) {
    verifyConnected();
    return CONVERSATION.findOne({
        $and: [
            {'users.pid': pids[0]},
            {'users.pid': pids[1]}
        ]
    });
}

async function getLatestMessage(pid, pid2) {
    verifyConnected();
    return POST.findOne({
        $or: [
            {pid: pid, message_to_pid: pid2},
            {pid: pid2, message_to_pid: pid}
        ]
    })
}

async function getPNIDS() {
    accountDB.verifyConnected();
    return PNID.find({});
}

async function getPNID(pid) {
    accountDB.verifyConnected();
    return PNID.findOne({
        pid: pid
    });
}



module.exports = {
    connect,
    getCommunities,
    getMostPopularCommunities,
    getNewCommunities,
    getSubCommunities,
    getCommunityByTitleID,
    getCommunityByID,
    getTotalPostsByCommunity,
    getDiscoveryHosts,
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
    getUsers,
    getUserByPID,
    getUserByUsername,
    getUserPostsAfterTimestamp,
    getUserPostsOffset,
    getCommunityPostsAfterTimestamp,
    getServerConfig,
    pushNewNotificationByPID,
    pushNewNotificationToAll,
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
    getPNID,
    getPNIDS
};

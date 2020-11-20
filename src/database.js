const mongoose = require('mongoose');
const { mongoose: mongooseConfig } = require('./config.json');
const { TOPIC } = require('./models/topic');
const { ENDPOINT } = require('./models/endpoint');
const { COMMUNITY } = require('./models/communities');
const { POST } = require('./models/post');
const { USER } = require('./models/user');
const { uri, database, options } = mongooseConfig;

let connection;

async function connect() {
    await mongoose.connect(`${uri}/${database}`, options);

    connection = mongoose.connection;
    connection.on('error', console.error.bind(console, 'connection error:'));
}

function verifyConnected() {
    if (!connection) {
        throw new Error('Cannot make database requets without being connected');
    }
}

async function getTopicByName(topicName) {
    verifyConnected();

    if (typeof topicName !== 'string') {
        return null;
    }

    return TOPIC.findOne({
        name: topicName
    });
}

async function getTopicByCommunityID(communityID) {
    verifyConnected();

    if (typeof communityID !== 'string') {
        return null;
    }

    return TOPIC.findOne({
        community_id: communityID
    });
}

async function getCommunities(numberOfCommunities) {
    verifyConnected();
    return COMMUNITY.find({}).limit(numberOfCommunities);
}

async function getMostPopularCommunities(numberOfCommunities) {
    verifyConnected();
    return COMMUNITY.find({}).sort({followers: -1}).limit(numberOfCommunities);
}

async function getNewCommunities(numberOfCommunities) {
    verifyConnected();
    return COMMUNITY.find({}).sort([['created_at', -1]]).limit(numberOfCommunities);
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
        id: community_id
    });
}

async function getNumberPostsByCommunity(community) {
    verifyConnected();
    return POST.find({
        title_id: community.title_id
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
        pid: userID
    });
}

async function getNumberPostsByUserID(userID) {
    verifyConnected();
    return POST.find({
        pid: userID
    }).countDocuments();
}

async function getHotPostsByCommunity(community, numberOfPosts) {
    verifyConnected();
    return POST.find({
        title_id: community.title_id
    }).sort({empathy_count: -1}).limit(numberOfPosts);
}
async function getPostsByCommunity(community, numberOfPosts) {
    verifyConnected();
    return POST.find({
        title_id: community.title_id
    }).limit(numberOfPosts);
}

async function getPostsByCommunityKey(community, numberOfPosts, search_key) {
    verifyConnected();
    return POST.find({
        title_id: community.title_id,
        search_key: search_key
    }).limit(numberOfPosts);
}

async function getNewPostsByCommunity(community, numberOfPosts) {
    verifyConnected();
    return POST.find({
        title_id: community.title_id
    }).sort({ created_at: -1 }).limit(numberOfPosts);
}

async function getDiscoveryHosts() {
    verifyConnected();
    return ENDPOINT.findOne({
        version: 1
    });
}

async function getUserByPID(PID) {
    verifyConnected();

    return USER.findOne({
        pid: PID
    });
}

async function getServerConfig() {
    verifyConnected();
    return ENDPOINT.findOne({
        type: "config"
    });
}

module.exports = {
    connect,
    getCommunities,
    getMostPopularCommunities,
    getNewCommunities,
    getCommunityByTitleID,
    getCommunityByID,
    getNumberPostsByCommunity,
    getDiscoveryHosts,
    getPostsByCommunity,
    getHotPostsByCommunity,
    getNewPostsByCommunity,
    getPostsByCommunityKey,
    getPostsByUserID,
    getNumberPostsByUserID,
    getPostByID,
    getUserByPID,
};
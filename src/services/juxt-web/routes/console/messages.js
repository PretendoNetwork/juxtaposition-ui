var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const { POST } = require('../../../../models/post');
var moment = require('moment');
const {COMMUNITY} = require("../../../../models/communities");
const snowflake = require('node-snowflake').Snowflake;
var router = express.Router();

router.get('/', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let conversations = await database.getConversations(user.pid.toString());
    let usersMap = await util.data.getUserHash();
    res.render(req.directory + '/messages.ejs', {
        moment: moment,
        user: user,
        conversations: conversations,
        cdnURL: config.CDN_domain,
        usersMap: usersMap,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.post('/new', async function (req, res, next) {
    let conversation = await database.getConversationByID(req.body.conversationID);
    if(req.body.conversationID === 0)
        return res.sendStatus(404);
    if(!conversation) {
        let user = await database.getUserByPID(req.pid);
        let user2 = await database.getUserByPID(req.body.message_to_pid);
        if(!user || !user2)
            return res.sendStatus(422)
        const document = {
            type: 3,
            community_id: snowflake.nextId(),
            created_at: moment(new Date()),
            last_updated: moment(new Date()),
            name: `Group DM ${user.pid} & ${user2.pid}`,
            users: [ user.pid, user2.pid]
        };
        const newCommunity = new COMMUNITY(document);
        await newCommunity.save();
        console.log(newCommunity);
    }
    conversation = await database.getConversationByUsers([req.pid.toString(), req.body.message_to_pid.toString()])
    let user = await database.getUserByPID(req.pid);
    console.log(conversation.community_id);
    const document = {
        screen_name: user.user_id,
        body: req.body.body,
        painting: req.body.raw,
        painting_uri: req.body.drawing,
        created_at: new Date(),
        id: snowflake.nextId(),
        mii: user.mii,
        mii_face_url: `https://mii.olv.pretendo.cc/${user.pid}/normal_face.png`,
        pid: user.pid,
        verified: user.official,
        parent: null,
        community_id: conversation.community_id,
        message_to_pid: req.body.message_to_pid
    };
    const newPost = new POST(document);
    newPost.save();
    res.sendStatus(200);
});

router.get('/:message_id', async function (req, res) {
    let conversation = await database.getConversationByID(req.params.message_id.toString());
    if(!conversation) {
        return res.sendStatus(404);
    }
    let user = await database.getUserByPID(req.pid);
    let otherUserPid = conversation.users[0] === user.pid ? conversation.users[0] : conversation.users[1];
    let user2 = await database.getUserByPID(otherUserPid);
    let messages = await database.getConversationMessages(conversation.community_id, 100, 0)
    res.render(req.directory + '/message_thread.ejs', {
        moment: moment,
        user: user,
        user2: user2,
        conversation: conversation,
        messages: messages,
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

module.exports = router;

var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const { POST } = require('../../../../models/post');
var moment = require('moment');
const {CONVERSATION} = require("../../../../models/conversation");
const snowflake = require('node-snowflake').Snowflake;
var router = express.Router();

router.get('/', async function (req, res) {
    let conversations = await database.getConversations(req.pid.toString());
    let usersMap = await util.data.getUserHash();
    res.render(req.directory + '/messages.ejs', {
        moment: moment,
        pid: req.pid,
        conversations: conversations,
        cdnURL: config.CDN_domain,
        usersMap: usersMap,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.post('/new', async function (req, res, next) {
    let conversation = await database.getConversationByID(req.body.conversationID);
    let user = await database.getPNID(req.pid);
    let user2 = await database.getPNID(req.body.message_to_pid);
    if(req.body.conversationID === 0)
        return res.sendStatus(404);
    if(!conversation) {
        if(!user || !user2)
            return res.sendStatus(422)
        let document = {
            id: snowflake.nextId(),
            users: [
                {
                    pid: user.pid,
                    official: (user.access_level === 2 || user.access_level === 3),
                    read: true
                },
                {
                    pid: user2.pid,
                    official: (user2.access_level === 2 || user2.access_level === 3),
                    read: false
                },
            ]
        };
        const newConversations = new CONVERSATION(document);
        await newConversations.save();
        conversation = await database.getConversationByID(document.id);
    }
    if(!conversation)
        return res.sendStatus(404);
    let document = {
        screen_name: user.username,
        body: req.body.body,
        painting: req.body.raw,
        painting_uri: req.body.drawing,
        created_at: new Date(),
        id: snowflake.nextId(),
        mii: user.mii.data,
        mii_face_url: `https://mii.olv.pretendo.cc/${user.pid}/normal_face.png`,
        pid: user.pid,
        verified: (user.access_level === 2 || user.access_level === 3),
        parent: null,
        community_id: conversation.id,
        message_to_pid: req.body.message_to_pid
    };
    const newPost = new POST(document);
    newPost.save();
    res.sendStatus(200);
    let postPreviewText;
    if(document.painting)
        postPreviewText = 'sent a Drawing'
    else if(document.body.length > 25)
        postPreviewText = document.body.substring(0, 25) + '...';
    else
        postPreviewText = document.body;
    await conversation.newMessage(postPreviewText, document.message_to_pid);
});

router.get('/new/:pid', async function (req, res, next) {
    let user = await database.getPNID(req.pid);
    let user2 = await database.getPNID(req.params.pid.toString());
    if(!user || !user2)
        return res.sendStatus(422)
    let conversation = await database.getConversationByUsers([user.pid, user2.pid]);
    if(conversation)
        return res.redirect(`/messages/${conversation.id}`);
    let document = {
        id: snowflake.nextId(),
        users: [
            {
                pid: user.pid,
                official: (user.access_level === 2 || user.access_level === 3),
                read: true
            },
            {
                pid: user2.pid,
                official: (user2.access_level === 2 || user2.access_level === 3),
                read: false
            },
        ]
    };
    const newConversations = new CONVERSATION(document);
    await newConversations.save();
    conversation = await database.getConversationByID(document.id);
    if(!conversation)
        return res.sendStatus(404);
    let body = `${user.mii.name} started a new chat!`;
    let newMessage = {
        screen_name: user.mii.name,
        body: body,
        created_at: new Date(),
        id: snowflake.nextId(),
        mii: user.mii.data,
        mii_face_url: `https://mii.olv.pretendo.cc/${user.pid}/normal_face.png`,
        pid: user.pid,
        verified: (user.access_level === 2 || user.access_level === 3),
        parent: null,
        community_id: conversation.id,
        message_to_pid: user2.pid
    };
    const newPost = new POST(newMessage);
    newPost.save();
    await conversation.newMessage(`${user.mii.name} started a new chat!`, newMessage.message_to_pid);
    res.redirect(`/messages/${conversation.id}`);
});

router.get('/:message_id', async function (req, res) {
    let conversation = await database.getConversationByID(req.params.message_id.toString());
    if(!conversation) {
        return res.sendStatus(404);
    }
    let user = await database.getUserByPID(req.pid);
    let otherUserPid = conversation.users[0].pid.toString() === user.pid.toString() ? conversation.users[1].pid : conversation.users[0].pid;
    let user2 = await database.getUserByPID(otherUserPid);
    let messages = await database.getConversationMessages(conversation.id, 100, 0)
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
    await conversation.markAsRead(req.pid);
});

module.exports = router;

var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
const config = require('../../../../config.json');
const { CONVERSATION } = require('../../../../models/conversation');
const { POST } = require('../../../../models/post');
var moment = require('moment');
const snowflake = require('node-snowflake').Snowflake;
var router = express.Router();

router.get('/', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let conversations = await database.getConversations(user.pid.toString());
    res.render(req.directory + '/messages.ejs', {
        moment: moment,
        user: user,
        conversations: conversations,
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.post('/new', async function (req, res, next) {
    let conversation = await database.getConversationByID(req.body.conversationID);
    if(!conversation) {
        let user = await database.getUserByPID(req.pid);
        let user2 = await database.getUserByPID(req.body.message_to_pid);
        if(!user || !user2)
            return res.sendStatus(422)
        let doc = {
            message_preview: req.body.body,
            pids: [
                {
                    pid: user.pid.toString(),
                    official: user.official,
                    screen_name: user.user_id,
                    read: true
                },
                {
                    pid: user2.pid.toString(),
                    official: user2.official,
                    screen_name: user2.user_id,
                    read: false
                }
            ]
        }
        const newConversation = new CONVERSATION(doc);
        await newConversation.save();
    }
    else {
        let messageType = '';
        if(req.body.screenshot)
            messageType = '(Screenshot)';
        else if(req.body.drawing)
            messageType = '(Drawing)';
        else
            messageType = req.body.body;
        await conversation.newMessage(messageType, req.pid.toString())
    }
    conversation = await database.getConversation(req.pid.toString(), req.body.message_to_pid.toString())
    let user = await database.getUserByPID(req.pid);
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
        message_to_pid: req.body.message_to_pid,
        conversation_id: conversation.id
    };
    const newPost = new POST(document);
    newPost.save();
    res.sendStatus(200);
});

router.get('/:message_id', async function (req, res) {
    let conversation = await database.getConversationByID(req.params.message_id.toString())
    if(!conversation) {
        return res.sendStatus(404);
    }
    let position = conversation.pids[0].pid === req.pid.toString() ? 1 : 0;
    let user = await database.getUserByPID(req.pid);
    let user2 = await database.getUserByPID(conversation.pids[position].pid);
    let messages = await database.getMessagesByID(conversation.id, 100)
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
    /*user.notification_list.filter(noti => noti.read === false).forEach(function(notification) {
        notification.read = true;
    });
    user.markModified('notification_list');*/
    user.save();
});

module.exports = router;

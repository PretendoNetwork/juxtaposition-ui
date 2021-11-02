var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
const config = require('../../../../config.json');
var moment = require('moment');
var router = express.Router();

router.get('/', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let conversations = await database.getConversations(user.pid);
    let recentMessages = [];
    for (let recentMessage of conversations) {
        let pid = recentMessage.pids.indexOf(user.pid) === 0 ? recentMessage.pids[1] : recentMessage.pids[0];
        let message = await database.getLatestMessage(req.pid, pid);
        if(message)
            recentMessages.push(message)
    }
    console.log(recentMessages);
    res.render(req.directory + '/messages.ejs', {
        moment: moment,
        database: database,
        user: user,
        conversations: conversations,
        recentMessages: recentMessages,
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

var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
const config = require('../../../../config.json');
var moment = require('moment');
var router = express.Router();

router.get('/', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let conversations = await database.getConversations(user.pid)
    res.render(req.directory + '/messages.ejs', {
        moment: moment,
        user: user,
        conversations: conversations,
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

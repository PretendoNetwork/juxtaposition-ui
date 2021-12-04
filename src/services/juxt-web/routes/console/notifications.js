var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../config.json');
var moment = require('moment');
var router = express.Router();

router.get('/', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    res.render(req.directory + '/notifications.ejs', {
        moment: moment,
        user: user,
        cdnURL: config.CDN_domain,
        lang: req.lang
    });
        user.notification_list.filter(noti => noti.read === false).forEach(function(notification) {
        notification.read = true;
    });
    user.markModified('notification_list');
    user.save();
});

module.exports = router;

var express = require('express');
const database = require('../../../../database');
const config = require('../../../../../config.json');
var moment = require('moment');
var router = express.Router();

router.get('/', async function (req, res) {
    let notifications = await database.getNotifications(req.pid, 25, 0);
    res.render(req.directory + '/notifications.ejs', {
        moment: moment,
        notifications: notifications,
        cdnURL: config.CDN_domain,
        lang: req.lang
    });
    notifications.filter(noti => noti.read === false).forEach(function(notification) {
        notification.markRead();
    });
});

module.exports = router;

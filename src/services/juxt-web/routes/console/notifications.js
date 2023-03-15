const express = require('express');
const ejs = require('ejs');
const database = require('../../../../database');
const config = require('../../../../../config.json');
const util = require('../../../../util');
const path = require('node:path');
const moment = require('moment');
const router = express.Router();

router.get('/my_news', async function (req, res) {
    let notifications = await database.getNotifications(req.pid, 25, 0);
    let userMap = util.data.getUserHash();
    let bundle = {
        notifications,
        userMap
    }

    if(req.query.pjax)
        return res.render(req.directory + '/partials/notifications.ejs', {
            bundle,
            moment
    });

    res.render(req.directory + '/notifications.ejs', {
        moment,
        selection: 0,
        bundle,
        cdnURL: config.CDN_domain,
        lang: req.lang,
        pid: req.pid,
        template: 'notifications'
    });
    notifications.filter(noti => noti.read === false).forEach(function(notification) {
        notification.markRead();
        console.log(notification)
    });
});

router.get('/friend_requests', async function (req, res) {
    let notifications = await database.getNotifications(req.pid, 25, 0);
    let bundle = {
        notifications
    }

    if(req.query.pjax)
        return res.render(req.directory + '/partials/not_ready.ejs', {
            bundle,
            moment
    });

    res.render(req.directory + '/notifications.ejs', {
        moment,
        selection: 1,
        bundle,
        cdnURL: config.CDN_domain,
        lang: req.lang,
        pid: req.pid,
        template: 'not_ready'
    });
    notifications.filter(noti => noti.read === false).forEach(function(notification) {
        notification.markRead();
        console.log(notification)
    });
});

module.exports = router;

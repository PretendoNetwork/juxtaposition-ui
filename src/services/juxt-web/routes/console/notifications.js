const express = require('express');
const ejs = require('ejs');
const database = require('../../../../database');
const config = require('../../../../../config.json');
const path = require('node:path');
const moment = require('moment');
const router = express.Router();

router.get('/my_news', async function (req, res) {
    let notifications = await database.getNotifications(req.pid, 25, 0);
    let directory = path.join(__dirname, '../../../../webfiles', req.directory);
    const html = await ejs.renderFile(directory + '/notifications.ejs', {
        moment: moment,
        notifications: notifications,
        cdnURL: config.CDN_domain,
        lang: req.lang,
        database: database,
        pid: req.pid
    },
        {async: true}
    );
    res.send(html);
    notifications.filter(noti => noti.read === false).forEach(function(notification) {
        notification.markRead();
        console.log(notification)
    });
});

module.exports = router;

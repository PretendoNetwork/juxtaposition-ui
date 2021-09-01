var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
const config = require('../../../../config.json');
var moment = require('moment');
var router = express.Router();

router.get('/', function (req, res) {
    res.header('X-Nintendo-WhiteList', config.whitelist);
    let lang = util.data.processLanguage(req.headers["x-nintendo-parampack"]);
    database.connect().then(async e => {

        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);

        if(pid === null)
            pid = 1000000000;
        let user = await database.getUserByPID(pid);
        res.render('portal/notifications.ejs', {
            moment: moment,
            user: user,
            cdnURL: config.CDN_domain,
            lang: lang
        });
        user.notification_list.filter(noti => noti.read === false).forEach(function(notification) {
            notification.read = true;
        });
        user.markModified('notification_list');
        user.save();
    }).catch(error => {
        console.log(error);
        res.set("Content-Type", "application/xml");
        res.statusCode = 400;
        response = {
            result: {
                has_error: 1,
                version: 1,
                code: 400,
                error_code: 15,
                message: "SERVER_ERROR"
            }
        };
        res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + xml(response));
    });
});

module.exports = router;

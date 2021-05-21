var express = require('express');
var router = express.Router();
const database = require('../../../../database');
const util = require('../../../../authentication');
var path = require('path');

router.get('/css/juxt.css', function (req, res) {
    res.set("Content-Type", "text/css");
    res.sendFile('css/juxt.css', {root: path.join(__dirname, '../../../../webfiles/ctr/')});
});

router.get('/js/juxt.js', function (req, res) {
    res.set("Content-Type", "application/javascript; charset=utf-8");
    res.sendFile('js/juxt.js', {root: path.join(__dirname, '../../../../webfiles/ctr/')});
});

router.get('/js/pjax.js', function (req, res) {
    res.set("Content-Type", "application/javascript; charset=utf-8");
    res.sendFile('js/pjax.js', {root: path.join(__dirname, '../../../../webfiles/ctr/')});
});

router.get('/fonts/Poppins-Light.woff', function (req, res) {
    res.set("Content-Type", "font/woff");
    res.sendFile('fonts/Poppins-Light.woff', {root: path.join(__dirname, '../../../../webfiles/ctr/')});
});

router.get('/fonts/Poppins-Light.ttf', function (req, res) {
    res.set("Content-Type", "font/ttf");
    res.sendFile('fonts/Poppins-Light.ttf', {root: path.join(__dirname, '../../../../webfiles/ctr/')});
});

router.get('/favicon.ico', function (req, res) {
    res.set("Content-Type", "image/x-icon");
    res.sendFile('css/favicon.ico', {root: path.join(__dirname, '../../../../webfiles/portal/')});
});

router.get('/icons/:image_id.png', function (req, res) {
    res.set("Content-Type", "image/png");
    database.connect().then(async e => {
        let community = await database.getCommunityByID(req.params.image_id.toString());
        if(community !== null) {
            if(community.browser_icon.indexOf('data:image/png;base64,') !== -1)
                res.send(Buffer.from(community.browser_icon.replace('data:image/png;base64,',''), 'base64'));
            else
                res.send(Buffer.from(community.browser_icon, 'base64'));
        }
        else {
            let user = await database.getUserByPID(req.params.image_id.toString());
            if(user !== null)
                if(user.pfp_uri.indexOf('data:image/png;base64,') !== -1)
                    res.send(Buffer.from(user.pfp_uri.replace('data:image/png;base64,',''), 'base64'));
                else
                    res.send(Buffer.from(user.pfp_uri, 'base64'));
            else
                res.sendStatus(404);
        }
    }).catch(error => {
        console.error(error);
        res.sendStatus(404)
    });
});

router.get('/tip/:image_id.png', function (req, res) {
    res.set("Content-Type", "image/png");
    database.connect().then(async e => {
        let community = await database.getCommunityByID(req.params.image_id.toString());
        if(community !== null) {
            if(community.browser_thumbnail.indexOf('data:image/png;base64,') !== -1)
                res.send(Buffer.from(community.browser_thumbnail.replace('data:image/png;base64,',''), 'base64'));
            else
                res.send(Buffer.from(community.browser_thumbnail, 'base64'));
        }
        else {
            let user = await database.getUserByPID(req.params.image_id.toString());
            if(user !== null)
                if(user.pfp_uri.indexOf('data:image/png;base64,') !== -1)
                    res.send(Buffer.from(user.pfp_uri.replace('data:image/png;base64,',''), 'base64'));
                else
                    res.send(Buffer.from(user.pfp_uri, 'base64'));
            else
                res.sendStatus(404);
        }
    }).catch(error => {
        console.error(error);
        res.sendStatus(404)
    });
});

router.get('/banner/:image_id.png', function (req, res) {
    res.set("Content-Type", "image/png");
    database.connect().then(async e => {
        let community = await database.getCommunityByID(req.params.image_id.toString());
        if(community !== null)
            if(community.WiiU_browser_header.indexOf('data:image/png;base64,') !== -1)
                res.send(Buffer.from(community.WiiU_browser_header.replace('data:image/png;base64,',''), 'base64'));
            else
                res.send(Buffer.from(community.WiiU_browser_header, 'base64'));
        else
            res.sendStatus(404);
    }).catch(error => {
        console.error(error);
        res.sendStatus(404)
    });
});

router.get('/notifications.json', function (req, res) {
    res.header('X-Nintendo-WhiteList','1|http,youtube.com,,2|https,youtube.com,,2|http,.youtube.com,,2|https,.youtube.com,,2|http,.ytimg.com,,2|https,.ytimg.com,,2|http,.googlevideo.com,,2|https,.googlevideo.com,,2|https,youtube.com,/embed/,6|https,youtube.com,/e/,6|https,youtube.com,/v/,6|https,www.youtube.com,/embed/,6|https,www.youtube.com,/e/,6|https,www.youtube.com,/v/,6|https,youtube.googleapis.com,/e/,6|https,youtube.googleapis.com,/v/,6|http,maps.googleapis.com,/maps/api/streetview,2|https,maps.googleapis.com,/maps/api/streetview,2|http,cbk0.google.com,/cbk,2|https,cbk0.google.com,/cbk,2|http,cbk1.google.com,/cbk,2|https,cbk1.google.com,/cbk,2|http,cbk2.google.com,/cbk,2|https,cbk2.google.com,/cbk,2|http,cbk3.google.com,/cbk,2|https,cbk3.google.com,/cbk,2|https,.cloudfront.net,,2|https,www.google-analytics.com,/,2|https,stats.g.doubleclick.net,,2|https,www.google.com,/ads/,2|https,ssl.google-analytics.com,,2|http,fonts.googleapis.com,,2||fonts.googleapis.com,,2');
    database.connect().then(async e => {
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
            pid = 1000000000;
        let user = await database.getUserByPID(pid);
        res.send(
            {
                messages: 0,
                news: user.notification_list.filter(notification => notification.read === false).length,
            }
        )

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

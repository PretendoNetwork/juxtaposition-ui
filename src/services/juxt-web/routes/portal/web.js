var express = require('express');
var router = express.Router();
const database = require('../../../../database');
const util = require('../../../../authentication');
var path = require('path');

router.get('/css/juxt.css', function (req, res) {
    res.sendFile('css/juxt.css', {root: path.join(__dirname, '../../../../webfiles/portal/')});
});

router.get('/js/juxt.js', function (req, res) {
    res.sendFile('js/juxt.js', {root: path.join(__dirname, '../../../../webfiles/portal/')});
});

router.get('/fonts/Poppins-Light.woff', function (req, res) {
    res.sendFile('fonts/Poppins-Light.woff', {root: path.join(__dirname, '../../../../webfiles/portal/')});
});

router.get('/fonts/Poppins-Light.ttf', function (req, res) {
    res.sendFile('fonts/Poppins-Light.ttf', {root: path.join(__dirname, '../../../../webfiles/portal/')});
});

router.get('/icons/:image_id.png', function (req, res) {
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

router.get('/banner/:image_id.png', function (req, res) {
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
                message_count: 0,
                notification_count: user.notification_list.filter(notification => notification.read === false).length,
                "messages": [
                    {
                        "screen_name": "JayDaBirb",
                        "mii_face_url": "http://mii-images.account.pretendo.cc/",
                        "is_official": true,
                        "is_read": false,
                        "created_at": "2020-04-29 01:04:80",
                        "feeling_id": 1,
                        "id": 1255383017044709400,
                        "message_content": "https://invite.gg/pretendo"
                    },
                    {
                        "screen_name": "PNID_Test06",
                        "mii_face_url": "http://mii-images.account.pretendo.cc/",
                        "is_official": false,
                        "is_read": true,
                        "created_at": "2020-05-18 02:17:50",
                        "feeling_id": 1,
                        "id": 1244384456055709400,
                        "message_content": "Testing message number 2 updated"
                    },
                    {
                        "screen_name": "PNID_Test14",
                        "mii_face_url": "http://mii-images.account.pretendo.cc/",
                        "is_official": false,
                        "is_read": true,
                        "created_at": "2020-05-18 02:17:50",
                        "feeling_id": 1,
                        "id": 1244384118059519400,
                        "message_content": "Testing message number 3"
                    },
                    {
                        "screen_name": "PNID_Test65",
                        "mii_face_url": "http://mii-images.account.pretendo.cc/",
                        "is_official": false,
                        "is_read": true,
                        "created_at": "2020-05-18 02:17:50",
                        "feeling_id": 1,
                        "id": 1244465118055709400,
                        "message_content": "Did you know our Miiverse fork is called Juxt? pretty cool huh? ;)"
                    },
                    {
                        "screen_name": "AnotherTestUser",
                        "mii_face_url": "http://mii-images.account.pretendo.cc/",
                        "is_official": false,
                        "is_read": true,
                        "created_at": "2020-05-18 02:17:50",
                        "feeling_id": 1,
                        "id": 1244384118792519400,
                        "message_content": "Frick frack tic tak"
                    },
                    {
                        "screen_name": "WowAnotherUserHuh",
                        "mii_face_url": "http://mii-images.account.pretendo.cc/",
                        "is_official": false,
                        "is_read": true,
                        "created_at": "2020-05-18 02:17:50",
                        "feeling_id": 1,
                        "id": 1244384648059589400,
                        "message_content": "Hey kid want some meme?"
                    },
                    {
                        "screen_name": "OkayLastOneIPromise",
                        "mii_face_url": "http://mii-images.account.pretendo.cc/",
                        "is_official": false,
                        "is_read": true,
                        "created_at": "2020-05-18 02:17:50",
                        "feeling_id": 1,
                        "id": 1244386594569545800,
                        "message_content": "I promise this is the last time I'll ask for mod pls I'm sorry"
                    }
                ],
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

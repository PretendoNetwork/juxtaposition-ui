var express = require('express');
var router = express.Router();
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
var path = require('path');

router.get('/css/:filename', function (req, res) {
    res.set("Content-Type", "text/css");
    res.sendFile('/css/' + req.params.filename, {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/js/:filename', function (req, res) {
    res.set("Content-Type", "application/javascript; charset=utf-8");
    res.sendFile('/js/' + req.params.filename, {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/fonts/:filename', function (req, res) {
    res.set("Content-Type", "font/woff");
    res.sendFile('/fonts/' + req.params.filename, {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/favicon.ico', function (req, res) {
    res.set("Content-Type", "image/x-icon");
    res.sendFile('/css/favicon.ico', {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/icons/:image_id.png', async function (req, res) {
    res.set("Content-Type", "image/png");
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
});

router.get('/tip/:image_id.png', async function (req, res) {
    res.set("Content-Type", "image/png");
    let community = await database.getCommunityByID(req.params.image_id.toString());
    if(community !== null) {
        if(community.browser_thumbnail.indexOf('data:image/png;base64,') !== -1)
            res.send(Buffer.from(community.browser_thumbnail.replace('data:image/png;base64,',''), 'base64'));
        else
            res.send(Buffer.from(community.browser_thumbnail, 'base64'));
    }
    else {
        let user = await database.getUserByPID(req.params.image_id.toString());
        if (user !== null)
            if (user.pfp_uri.indexOf('data:image/png;base64,') !== -1)
                res.send(Buffer.from(user.pfp_uri.replace('data:image/png;base64,', ''), 'base64'));
            else
                res.send(Buffer.from(user.pfp_uri, 'base64'));
        else
            res.sendStatus(404);
    }

});

router.get('/banner/:image_id.png', async function (req, res) {
    res.set("Content-Type", "image/png");
    let community = await database.getCommunityByID(req.params.image_id.toString());
    if(community !== null)
        if(community.WiiU_browser_header.indexOf('data:image/png;base64,') !== -1)
            res.send(Buffer.from(community.WiiU_browser_header.replace('data:image/png;base64,',''), 'base64'));
        else
            res.send(Buffer.from(community.WiiU_browser_header, 'base64'));
    else
        res.sendStatus(404);
});

router.get('/screenshot/:image_id.png', async function (req, res) {
    res.set("Content-Type", "image/png");
    let post = await database.getPostByID(req.params.image_id.toString());
    if(post !== null && post.screenshot !== '')
        if(post.screenshot.indexOf('data:image/png;base64,') !== -1)
            res.send(Buffer.from(post.screenshot.replace('data:image/png;base64,',''), 'base64'));
        else
            res.send(Buffer.from(post.screenshot, 'base64'));
    else
        res.sendStatus(404);
});

router.get('/drawing/:image_id.png', async function (req, res) {
    res.set("Content-Type", "image/png");
    let post = await database.getPostByID(req.params.image_id.toString());
    if(post !== null && post.painting_uri !== '')
        if(post.painting_uri.indexOf('data:image/png;base64,') !== -1)
            res.send(Buffer.from(post.painting_uri.replace('data:image/png;base64,',''), 'base64'));
        else
            res.send(Buffer.from(post.painting_uri, 'base64'));
    else
        res.sendStatus(404);
});

router.get('/notifications.json', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    if(!user)
        return res.sendStatus(403);
    if(user.notification_list) {
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
    }
});

router.get('/:post_id/oembed.json', async function (req, res) {
    let post = await database.getPostByID(req.params.post_id.toString());
    let user = await database.getUserByPID(post.pid);
    let doc = {
        "author_name": user.user_id,
        "author_url": "https://portal.olv.pretendo.cc/users/show?pid=" + user.pid,
    }
    res.send(doc)
});

module.exports = router;

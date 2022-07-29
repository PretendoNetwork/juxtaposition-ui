var express = require('express');
var router = express.Router();
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../util');
var path = require('path');

router.get('/', function (req, res) {
    res.redirect('/activity-feed')
});

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

router.get('/downloadUserData.json', async function (req, res) {
    res.set("Content-Type", "text/json");
    let posts = await database.getUserPostsOffset(req.pid, 100000, 0);
    let user = await database.getUserByPID(req.pid);
    let doc = {
        "user": user,
        "content": posts,
    }
    res.send(doc)
});

module.exports = router;

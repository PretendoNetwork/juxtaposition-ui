var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
const config = require('../../../../config.json');
var multer  = require('multer');
var moment = require('moment');
var upload = multer({ dest: 'uploads/' });
var router = express.Router();

router.get('/me', function (req, res) {
    res.header('X-Nintendo-WhiteList','1|http,youtube.com,,2|https,youtube.com,,2|http,pretendo.cc,,2|https,pretendo.cc,,2');
    var isAJAX = ((req.query.ajax+'').toLowerCase() === 'true')
    database.connect().then(async e => {

        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
            pid = 1000000000;
        let user = await database.getUserByPID(pid);
        let newPosts = await database.getNumberUserPostsByID(pid, 1);
        let numPosts = await database.getTotalPostsByUserID(pid);
        let communityMap = await util.data.getCommunityHash();
        if(isAJAX) {
            res.render('portal/me_page_ajax.ejs', {
                // EJS variable and server-side variable
                communityMap: communityMap,
                moment: moment,
                user: user,
                newPosts: newPosts,
                numPosts: numPosts,
                account_server: config.account_server_domain.slice(8),
            });
        }
        else {
            res.render('portal/me_page.ejs', {
                // EJS variable and server-side variable
                communityMap: communityMap,
                moment: moment,
                user: user,
                newPosts: newPosts,
                numPosts: numPosts,
                account_server: config.account_server_domain.slice(8),
            });
        }

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

router.post('/me', upload.none(), function (req, res) {
    database.connect().then(async e => {
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);
        if (pid === null)
            throw new Error('User does not exist');
        let user = await database.getUserByPID(pid);

        user.country_visibility = !!req.body.country;

        user.birthday_visibility = !!req.body.birthday;

        user.game_skill_visibility = !!req.body.experience;

        user.profile_comment_visibility = !!req.body.commentShow;

        if (req.body.comment)
            user.setProfileComment(req.body.comment);

        res.redirect('/users/me');

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
    })
});

router.get('/show', function (req, res) {
    res.header('X-Nintendo-WhiteList','1|http,youtube.com,,2|https,youtube.com,,2|http,.youtube.com,,2|https,.youtube.com,,2|http,.ytimg.com,,2|https,.ytimg.com,,2|http,.googlevideo.com,,2|https,.googlevideo.com,,2|https,youtube.com,/embed/,6|https,youtube.com,/e/,6|https,youtube.com,/v/,6|https,www.youtube.com,/embed/,6|https,www.youtube.com,/e/,6|https,www.youtube.com,/v/,6|https,youtube.googleapis.com,/e/,6|https,youtube.googleapis.com,/v/,6|http,maps.googleapis.com,/maps/api/streetview,2|https,maps.googleapis.com,/maps/api/streetview,2|http,cbk0.google.com,/cbk,2|https,cbk0.google.com,/cbk,2|http,cbk1.google.com,/cbk,2|https,cbk1.google.com,/cbk,2|http,cbk2.google.com,/cbk,2|https,cbk2.google.com,/cbk,2|http,cbk3.google.com,/cbk,2|https,cbk3.google.com,/cbk,2|https,.cloudfront.net,,2|https,www.google-analytics.com,/,2|https,stats.g.doubleclick.net,,2|https,www.google.com,/ads/,2|https,ssl.google-analytics.com,,2|http,fonts.googleapis.com,,2|fonts.googleapis.com,,2|https,www.googletagmanager.com,,2');
    var userID = req.query.pid;
    if(userID === 'me') {
        res.sendStatus(504);
        return;
    }
    database.connect().then(async e => {
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
            pid = 1000000000;
        let parentUser = await database.getUserByPID(pid);
        let user = await database.getUserByPID(userID);
        if(user === null)
            res.sendStatus(404);
        if(user.pid === parentUser.pid)
            res
        let newPosts = await database.getNumberUserPostsByID(user.pid, 10);
        let numPosts = await database.getTotalPostsByUserID(user.pid);
        let communityMap = await util.data.getCommunityHash();
        res.render('portal/user_page.ejs', {
            // EJS variable and server-side variable
            communityMap: communityMap,
            moment: moment,
            user: user,
            newPosts: newPosts,
            numPosts: numPosts,
            parentUser: parentUser,
            account_server: config.account_server_domain.slice(8),
        });
    }).catch(error => {
        console.error(error);
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

router.get('/loadPosts', function (req, res) {
    res.header('X-Nintendo-WhiteList','1|http,youtube.com,,2|https,youtube.com,,2|http,.youtube.com,,2|https,.youtube.com,,2|http,.ytimg.com,,2|https,.ytimg.com,,2|http,.googlevideo.com,,2|https,.googlevideo.com,,2|https,youtube.com,/embed/,6|https,youtube.com,/e/,6|https,youtube.com,/v/,6|https,www.youtube.com,/embed/,6|https,www.youtube.com,/e/,6|https,www.youtube.com,/v/,6|https,youtube.googleapis.com,/e/,6|https,youtube.googleapis.com,/v/,6|http,maps.googleapis.com,/maps/api/streetview,2|https,maps.googleapis.com,/maps/api/streetview,2|http,cbk0.google.com,/cbk,2|https,cbk0.google.com,/cbk,2|http,cbk1.google.com,/cbk,2|https,cbk1.google.com,/cbk,2|http,cbk2.google.com,/cbk,2|https,cbk2.google.com,/cbk,2|http,cbk3.google.com,/cbk,2|https,cbk3.google.com,/cbk,2|https,.cloudfront.net,,2|https,www.google-analytics.com,/,2|https,stats.g.doubleclick.net,,2|https,www.google.com,/ads/,2|https,ssl.google-analytics.com,,2|http,fonts.googleapis.com,,2|fonts.googleapis.com,,2|https,www.googletagmanager.com,,2');
    database.connect().then(async e => {
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);
        let post = await database.getPostByID(req.query.postID);
        if(pid === null)
            pid = 1000000000;
        let user = await database.getUserByPID(pid);
        let newPosts = await database.getUserPostsAfterTimestamp(post, 5);
        let communityMap = await util.data.getCommunityHash();
        if(newPosts.length > 0)
        {
            res.render('portal/more_posts.ejs', {
                communityMap: communityMap,
                moment: moment,
                user: user,
                newPosts: newPosts,
                account_server: config.account_server_domain.slice(8),
            });
        }
        else
        {
            res.sendStatus(204);
        }
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

router.post('/follow', upload.none(), function (req, res) {
    database.connect().then(async e => {
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);
        let userToFollow = await database.getUserByPID(req.body.userID);
        if(pid === null)
            pid = 1000000000;
        let user = await database.getUserByPID(pid);
        if(req.body.type === 'true' && user !== null && user.followed_users.indexOf(userToFollow.pid) === -1)
        {
            userToFollow.addToFollowers(user.pid);
            user.addToUsers(userToFollow.pid);
            res.sendStatus(200);
            await database.pushNewNotificationByPID(userToFollow.pid, user.user_id + ' followed you!', '/users/show?pid=' + user.pid)
        }
        else if(req.body.type === 'false' && user !== null  && user.followed_users.indexOf(userToFollow.pid) !== -1)
        {
            userToFollow.removeFromFollowers(user.pid);
            user.removeFromUsers(userToFollow.pid);
            res.sendStatus(200);
        }
        else
            res.sendStatus(423);

    }).catch(error => {
        console.log(error);
        res.set("Content-Type", "application/xml");
        res.statusCode = 423;
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

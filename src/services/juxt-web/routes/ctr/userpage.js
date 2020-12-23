var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
const ejs = require('ejs');
var router = express.Router();

/* GET discovery server. */
router.get('/me', function (req, res) {
    res.header('X-Nintendo-WhiteList','1|http,youtube.com,,2|https,youtube.com,,2|http,.youtube.com,,2|https,.youtube.com,,2|http,.ytimg.com,,2|https,.ytimg.com,,2|http,.googlevideo.com,,2|https,.googlevideo.com,,2|https,youtube.com,/embed/,6|https,youtube.com,/e/,6|https,youtube.com,/v/,6|https,www.youtube.com,/embed/,6|https,www.youtube.com,/e/,6|https,www.youtube.com,/v/,6|https,youtube.googleapis.com,/e/,6|https,youtube.googleapis.com,/v/,6|http,maps.googleapis.com,/maps/api/streetview,2|https,maps.googleapis.com,/maps/api/streetview,2|http,cbk0.google.com,/cbk,2|https,cbk0.google.com,/cbk,2|http,cbk1.google.com,/cbk,2|https,cbk1.google.com,/cbk,2|http,cbk2.google.com,/cbk,2|https,cbk2.google.com,/cbk,2|http,cbk3.google.com,/cbk,2|https,cbk3.google.com,/cbk,2|https,.cloudfront.net,,2|https,www.google-analytics.com,/,2|https,stats.g.doubleclick.net,,2|https,www.google.com,/ads/,2|https,ssl.google-analytics.com,,2|http,fonts.googleapis.com,,2||fonts.googleapis.com,,2');
    var isAJAX = ((req.query.ajax+'').toLowerCase() === 'true')
    database.connect().then(async e => {

        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);
        //console.log(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
            pid = 1000000000;
        let user = await database.getUserByPID(pid);
        let newPosts = await database.getPostsByUserID(pid);
        let numPosts = await database.getNumberPostsByUserID(pid);
        if(isAJAX) {
            res.render('ctr_user_page_ajax.ejs', {
                // EJS variable and server-side variable
                user: user,
                newPosts: newPosts,
                numPosts: numPosts
            });
        }
        else {
            res.render('portal_user_page.ejs', {
                // EJS variable and server-side variable
                user: user,
                newPosts: newPosts,
                numPosts: numPosts
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

router.get('/show', function (req, res) {
    res.header('X-Nintendo-WhiteList','1|http,youtube.com,,2|https,youtube.com,,2|http,.youtube.com,,2|https,.youtube.com,,2|http,.ytimg.com,,2|https,.ytimg.com,,2|http,.googlevideo.com,,2|https,.googlevideo.com,,2|https,youtube.com,/embed/,6|https,youtube.com,/e/,6|https,youtube.com,/v/,6|https,www.youtube.com,/embed/,6|https,www.youtube.com,/e/,6|https,www.youtube.com,/v/,6|https,youtube.googleapis.com,/e/,6|https,youtube.googleapis.com,/v/,6|http,maps.googleapis.com,/maps/api/streetview,2|https,maps.googleapis.com,/maps/api/streetview,2|http,cbk0.google.com,/cbk,2|https,cbk0.google.com,/cbk,2|http,cbk1.google.com,/cbk,2|https,cbk1.google.com,/cbk,2|http,cbk2.google.com,/cbk,2|https,cbk2.google.com,/cbk,2|http,cbk3.google.com,/cbk,2|https,cbk3.google.com,/cbk,2|https,.cloudfront.net,,2|https,www.google-analytics.com,/,2|https,stats.g.doubleclick.net,,2|https,www.google.com,/ads/,2|https,ssl.google-analytics.com,,2|http,fonts.googleapis.com,,2||fonts.googleapis.com,,2');
    var isAJAX = ((req.query.ajax+'').toLowerCase() === 'true')
    var userID = req.query.pid;
    database.connect().then(async e => {
        let user = await database.getUserByPID(userID);
        let newPosts = await database.getPostsByUserID(user.pid);
        let numPosts = await database.getNumberPostsByUserID(user.pid);
        if(isAJAX) {
            res.render('portal_user_page_ajax.ejs', {
                // EJS variable and server-side variable
                user: user,
                newPosts: newPosts,
                numPosts: numPosts
            });
        }
        else {
            res.render('portal_user_page.ejs', {
                // EJS variable and server-side variable
                user: user,
                newPosts: newPosts,
                numPosts: numPosts
            });
        }
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

module.exports = router;

var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
const config = require('../../../../config.json');
const { POST } = require('../../../../models/post');
var multer  = require('multer');
var moment = require('moment');
var upload = multer({ dest: 'uploads/' });
const snowflake = require('node-snowflake').Snowflake;
var router = express.Router();

router.post('/empathy', function (req, res) {
    database.connect().then(async e => {
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);
        let post = await database.getPostByID(req.body.postID);
        if(pid === null) {
            res.sendStatus(403);
            return;
        }
        let user = await database.getUserByPID(pid);
        if(req.body.type === 'up' && user.likes.indexOf(post.id) === -1 && user.id !== post.pid)
        {
            post.upEmpathy();
            user.addToLikes(post.id)
            res.sendStatus(200);
        }
        else if(req.body.type === 'down' && user.likes.indexOf(post.id) !== -1 && user.id !== post.pid)
        {
            post.downEmpathy();
            user.removeFromLike(post.id);
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

router.get('/:post_id', function (req, res) {
    res.header('X-Nintendo-WhiteList', config.whitelist);
    let lang = util.data.processLanguage(req.headers["x-nintendo-parampack"]);
    database.connect().then(async e => {

        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);

        if(pid === null)
            pid = 1000000000;
        let user = await database.getUserByPID(pid);
        let post = await database.getPostByID(req.params.post_id.toString());
        let community = await database.getCommunityByID(post.community_id)
        res.render('portal/post.ejs', {
            moment: moment,
            user: user,
            post: post,
            community: community,
            cdnURL: config.CDN_domain,
            lang: lang,
            mii_image_CDN: config.mii_image_CDN
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

router.post('/new', upload.none(), async function (req, res, next) {
    try
    {
        let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
        {
            throw new Error('The User token was not valid');
        }
        else
        {
            let usrObj = await database.getUserByPID(pid);
            if(usrObj.account_status !== 0) {
                throw new Error('User not allowed to post')
            }
            let community = await database.getCommunityByID(req.body.olive_community_id);
            let appData = "";
            if (req.body.app_data) {
                appData = req.body.app_data.replace(/\0/g, "").trim();
            }
            let painting = "", paintingURI = "";
            if (req.body.painting && req.body.painting !== 'eJztwTEBACAMA7DCNRlIQRbu4ZoEviTJTNvjZNUFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL55fYLL3w==') {
                painting = req.body.painting.replace(/\0/g, "").trim();
                paintingURI = await util.data.processPainting(painting);
            }
            let screenshot = "";
            if (req.body.screenshot) {
                screenshot = req.body.screenshot.replace(/\0/g, "").trim();
            }
            const document = {
                title_id: community.title_id[0],
                community_id: community.community_id,
                screen_name: usrObj.user_id,
                body: req.body.body,
                app_data: appData,
                painting: painting,
                painting_uri: paintingURI,
                screenshot: screenshot,
                country_id: paramPackData.country_id,
                created_at: new Date(),
                feeling_id: req.body.emotion,
                id: snowflake.nextId(),
                is_autopost: req.body.is_autopost,
                is_spoiler: req.body.is_spoiler,
                is_app_jumpable: req.body.is_app_jumpable,
                language_id: req.body.language_id,
                mii: usrObj.mii,
                mii_face_url: usrObj.pfp_uri,
                pid: pid,
                platform_id: paramPackData.platform_id,
                region_id: paramPackData.region_id,
                verified: usrObj.official
            };
            const newPost = new POST(document);
            newPost.save();
            res.redirect('/communities/' + community.community_id + '/new');
        }
    }
    catch (e)
    {
        console.error(e);
        res.set("Content-Type", "application/xml");
        res.statusCode = 400;
        response = {
            result: {
                has_error: 1,
                version: 1,
                code: 400,
                error_code: 7,
                message: "POSTING_FROM_NNID"
            }
        };
        res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + xml(response));
    }

});

module.exports = router;

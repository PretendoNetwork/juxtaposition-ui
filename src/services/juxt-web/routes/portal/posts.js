var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
const { POST } = require('../../../../models/post');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
const snowflake = require('node-snowflake').Snowflake;
var router = express.Router();

router.post('/empathy', function (req, res) {
    database.connect().then(async e => {
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);
        let post = await database.getPostByID(req.body.postID);
        if(pid === null)
            pid = 1000000000;
        let user = await database.getUserByPID(pid);
        if(req.body.type === 'up' && user !== null && user.likes.indexOf(post.id) === -1 && user.id !== post.pid)
        {
            post.upEmpathy();
            user.addToLikes(post.id)
            res.sendStatus(200);
        }
        else if(req.body.type === 'down' && user !== null  && user.likes.indexOf(post.id) !== -1 && user.id !== post.pid)
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
            let painting = "";
            if (req.body.painting) {
                painting = req.body.painting.replace(/\0/g, "").trim();
            }
            let paintingURI = "";
            if (req.body.painting) {
                paintingURI = await util.data.processPainting(painting);
            }
            let screenshot = "";
            if (req.body.screenshot) {
                screenshot = req.body.screenshot.replace(/\0/g, "").trim();
            }
            const document = {
                title_id: community.title_id[0],
                screen_name: usrObj.user_id,
                body: req.body.body,
                app_data: appData,
                painting: painting,
                painting_uri: paintingURI,
                screenshot: screenshot,
                community_id: req.body.community_id,
                country_id: paramPackData.country_id,
                created_at: new Date(),
                feeling_id: req.body.feeling_id,
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
            };
            const newPost = new POST(document);
            newPost.save();
            res.redirect('/communities/' + community.community_id);
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

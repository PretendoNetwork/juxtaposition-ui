var express = require('express');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../config.json');
const { POST } = require('../../../../models/post');
var multer  = require('multer');
var moment = require('moment');
var upload = multer({ dest: 'uploads/' });
const snowflake = require('node-snowflake').Snowflake;
var router = express.Router();

router.post('/empathy', async function (req, res) {
    let post = await database.getPostByID(req.body.postID);
    let user = await database.getUserByPID(req.pid);
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
});

router.get('/:post_id', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let post = await database.getPostByID(req.params.post_id.toString());
    if(post === null)
        return res.sendStatus(404);
    let community = await database.getCommunityByID(post.community_id);
    let communityMap = await util.data.getCommunityHash();
    let replies = await database.getPostReplies(req.params.post_id.toString(), 25)
    res.render(req.directory + '/post.ejs', {
        moment: moment,
        user: user,
        post: post,
        replies: replies,
        community: community,
        communityMap: communityMap,
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.post('/:post_id/new', upload.none(), async function (req, res, next) {
    let user = await database.getUserByPID(req.pid);
    if(user.account_status !== 0 || req.body.olive_community_id === 'announcements') {
        throw new Error('User not allowed to post')
    }
    let parentPost = await database.getPostByID(req.params.post_id.toString());
    if(!parentPost)
        return res.sendStatus(403);
    let community = await database.getCommunityByID(req.body.olive_community_id);
    if(req.body.body === '' && req.body.painting === ''  && req.body.screenshot === '') {
        res.status(422);
        return res.redirect('/posts/' + req.params.post_id.toString());
    }
    let appData = "";
    if (req.body.app_data) {
        appData = req.body.app_data.replace(/\0/g, "").trim();
    }
    let painting = "", paintingURI = "";
    if (req.body.painting && req.body.painting !== 'eJztwTEBACAMA7DCNRlIQRbu4ZoEviTJTNvjZNUFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL55fYLL3w==') {
        painting = req.body.painting.replace(/\0/g, "").trim();
        paintingURI = await util.data.processPainting(painting, true);
    }
    let screenshot = "";
    if (req.body.screenshot) {
        screenshot = req.body.screenshot.replace(/\0/g, "").trim();
    }

    let miiFace;
    switch (parseInt(req.body.emotion)) {
        case 1:
            miiFace = 'smile_open_mouth.png';
            break;
        case 2:
            miiFace = 'wink_left.png';
            break;
        case 3:
            miiFace = 'surprise_open_mouth.png';
            break;
        case 4:
            miiFace = 'frustrated.png';
            break;
        case 5:
            miiFace = 'sorrow.png';
            break;
        default:
            miiFace = 'normal_face.png';
            break;
    }


    parentPost.reply_count = parentPost.reply_count + 1;
    parentPost.save();
    const document = {
        title_id: community.title_id[0],
        community_id: community.community_id,
        screen_name: user.user_id,
        body: req.body.body,
        app_data: appData,
        painting: painting,
        painting_uri: paintingURI,
        screenshot: screenshot,
        country_id: req.paramPackData.country_id,
        created_at: new Date(),
        feeling_id: req.body.emotion,
        id: snowflake.nextId(),
        is_autopost: req.body.is_autopost,
        is_spoiler: (req.body.spoiler) ? 1 : 0,
        is_app_jumpable: req.body.is_app_jumpable,
        language_id: req.body.language_id,
        mii: user.mii,
        mii_face_url: `http://mii.olv.pretendo.cc/mii/${user.pid}/${miiFace}`,
        pid: req.pid,
        platform_id: req.paramPackData.platform_id,
        region_id: req.paramPackData.region_id,
        verified: user.official,
        parent: parentPost.id
    };
    const newPost = new POST(document);
    newPost.save();
    if(parentPost.pid !== user.pid)
        await database.pushNewNotificationByPID(parentPost.pid, user.user_id + ' replied to your post!', '/posts/' + parentPost.id)
    res.redirect('/posts/' + req.params.post_id.toString());
});

router.post('/new', upload.none(), async function (req, res, next) {
    let user = await database.getUserByPID(req.pid);
    if(user.account_status !== 0) {
        throw new Error('User not allowed to post')
    }
    let community = await database.getCommunityByID(req.body.olive_community_id);
    if(community.community_id === 'announcements')
        return res.sendStatus(403)
    if(req.body.body === '' && req.body.painting === ''  && req.body.screenshot === '') {
        res.status(422);
        return res.redirect('/communities/' + community.community_id + '/new');
    }
    let appData = "";
    if (req.body.app_data) {
        appData = req.body.app_data.replace(/\0/g, "").trim();
    }
    let painting = "", paintingURI = "";
    if (req.body.painting && req.body.painting !== 'eJztwTEBACAMA7DCNRlIQRbu4ZoEviTJTNvjZNUFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL55fYLL3w==') {
        painting = req.body.painting.replace(/\0/g, "").trim();
        paintingURI = await util.data.processPainting(painting, true);
    }
    let screenshot = "";
    if (req.body.screenshot) {
        screenshot = req.body.screenshot.replace(/\0/g, "").trim();
    }

    let miiFace;
    console.log(parseInt(req.body.emotion))
    switch (parseInt(req.body.emotion)) {
        case 1:
            miiFace = 'smile_open_mouth.png';
            break;
        case 2:
            miiFace = 'wink_left.png';
            break;
        case 3:
            miiFace = 'surprise_open_mouth.png';
            break;
        case 4:
            miiFace = 'frustrated.png';
            break;
        case 5:
            miiFace = 'sorrow.png';
            break;
        default:
            miiFace = 'normal_face.png';
            break;
    }

    const document = {
        title_id: community.title_id[0],
        community_id: community.community_id,
        screen_name: user.user_id,
        body: req.body.body,
        app_data: appData,
        painting: painting,
        painting_uri: paintingURI,
        screenshot: screenshot,
        country_id: req.paramPackData.country_id,
        created_at: new Date(),
        feeling_id: req.body.emotion,
        id: snowflake.nextId(),
        is_autopost: req.body.is_autopost,
        is_spoiler: (req.body.spoiler) ? 1 : 0,
        is_app_jumpable: req.body.is_app_jumpable,
        language_id: req.body.language_id,
        mii: user.mii,
        mii_face_url: `http://mii.olv.pretendo.cc/mii/${user.pid}/${miiFace}`,
        pid: req.pid,
        platform_id: req.paramPackData.platform_id,
        region_id: req.paramPackData.region_id,
        verified: user.official
    };
    const newPost = new POST(document);
    newPost.save();
    res.redirect('/communities/' + community.community_id + '/new');
});

module.exports = router;

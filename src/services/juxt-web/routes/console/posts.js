const express = require('express');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const { POST } = require('../../../../models/post');
const multer = require('multer');
const moment = require('moment');
const rateLimit = require('express-rate-limit')
const upload = multer({dest: 'uploads/'});
const snowflake = require('node-snowflake').Snowflake;
const router = express.Router();

const postLimit = rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    max: 1, // Limit each IP to 1 request per `window`
    standardHeaders: true,
    legacyHeaders: true,
})

const yeahLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per `window`
    standardHeaders: true,
    legacyHeaders: true,
})

router.post('/empathy', yeahLimit, async function (req, res) {
    let post = await database.getPostByID(req.body.postID);
    if(!post)
        return res.sendStatus(404);
    let userContent = await database.getUserContent(req.pid);
    if(!userContent)
        return res.sendStatus(423);
    if(userContent.likes.indexOf(post.id) === -1 && userContent.pid !== post.pid)
    {
        post.upEmpathy();
        userContent.addToLikes(post.id)
        res.send({ status: 200, id: post.id, count: post.empathy_count });
        if(req.pid !== post.pid)
            await util.data.newNotification({ pid: post.pid, type: "yeah", user: req.pid, link: `/posts/${post.id}` });
    }
    else if(userContent.likes.indexOf(post.id) !== -1 && userContent.pid !== post.pid)
    {
        post.downEmpathy();
        userContent.removeFromLike(post.id);
        res.send({ status: 200, id: post.id, count: post.empathy_count });
    }
    else
        res.send({ status: 423, id: post.id, count: post.empathy_count });
});

router.post('/new', postLimit, upload.none(), async function (req, res) { await newPost(req, res)});

router.get('/:post_id', async function (req, res) {
    let userSettings = await database.getUserSettings(req.pid);
    let userContent = await database.getUserContent(req.pid);
    let post = await database.getPostByID(req.params.post_id.toString());
    if(post.parent) {
        post = await database.getPostByID(post.parent);
        if(post === null)
            return res.sendStatus(404);
        return res.redirect(`/posts/${post.id}`);
    }

    if(post === null)
        return res.sendStatus(404);
    let community = await database.getCommunityByID(post.community_id);
    let communityMap = await util.data.getCommunityHash();
    let replies = await database.getPostReplies(req.params.post_id.toString(), 25)
    res.render(req.directory + '/post.ejs', {
        moment: moment,
        userSettings: userSettings,
        userContent: userContent,
        post: post,
        replies: replies,
        community: community,
        communityMap: communityMap,
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid
    });
});

router.post('/:post_id/new', postLimit, upload.none(), async function (req, res) { await newPost(req, res);});

async function newPost(req, res) {
    let PNID = await database.getPNID(req.pid), userSettings = await database.getUserSettings(req.pid), parentPost = null, postID = snowflake.nextId();
    let community = await database.getCommunityByID(req.body.community_id);
    if(!community || userSettings.account_status !== 0 || community.community_id === 'announcements')
        return res.sendStatus(403);
    if(req.params.post_id) {
        parentPost = await database.getPostByID(req.params.post_id.toString());
        if(!parentPost)
            return res.sendStatus(403);
        parentPost.reply_count = parentPost.reply_count + 1;
        parentPost.save();
    }
    if(req.body.body === '' && req.body.painting === ''  && req.body.screenshot === '') {
        res.status(422);
        return res.redirect('/posts/' + req.params.post_id.toString());
    }
    let painting = "", paintingURI = "", screenshot = null;
    if (req.body._post_type === 'painting' && req.body.painting) {
        painting = req.body.painting.replace(/\0/g, "").trim();
        paintingURI = await util.data.processPainting(painting, true);
        await util.data.uploadCDNAsset('pn-cdn', `paintings/${req.pid}/${postID}.png`, paintingURI, 'public-read');
    }
    if (req.body.screenshot) {
        screenshot = req.body.screenshot.replace(/\0/g, "").trim();
        await util.data.uploadCDNAsset('pn-cdn', `screenshots/${req.pid}/${postID}.jpg`, Buffer.from(screenshot, 'base64'), 'public-read');
    }

    let miiFace;
    switch (parseInt(req.body.feeling_id)) {
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
    let body = req.body.body;
    if(body)
        body = req.body.body.replace(/[^A-Za-z\d\s-_!@#$%^&*(){}‛¨ƒºª«»“”„¿¡←→↑↓√§¶†‡¦–—⇒⇔¤¢€£¥™©®+×÷=±∞ˇ˘˙¸˛˜′″µ°¹²³♭♪•…¬¯‰¼½¾♡♥●◆■▲▼☆★♀♂,./?;:'"\[\]]/g, "");
    if(body.length > 280)
        body = body.substring(0,280);
    const document = {
        title_id: community.title_id[0],
        community_id: community.community_id,
        screen_name: userSettings.screen_name,
        body: body,
        painting: painting,
        screenshot: screenshot ? `/screenshots/${req.pid}/${postID}.jpg`: "",
        country_id: req.paramPackData ? req.paramPackData.country_id : 49,
        created_at: new Date(),
        feeling_id: req.body.feeling_id,
        id: postID,
        is_autopost: 0,
        is_spoiler: (req.body.spoiler) ? 1 : 0,
        is_app_jumpable: req.body.is_app_jumpable,
        language_id: req.body.language_id,
        mii: PNID.mii.data,
        mii_face_url: `http://mii.olv.pretendo.cc/mii/${PNID.pid}/${miiFace}`,
        pid: req.pid,
        platform_id: req.paramPackData ? req.paramPackData.platform_id : 0,
        region_id: req.paramPackData ? req.paramPackData.region_id : 2,
        verified: (PNID.access_level === 2 || PNID.access_level === 3),
        parent: parentPost ? parentPost.id : null
    };
    let duplicatePost = await database.getDuplicatePosts(req.pid, document);
    if(duplicatePost && req.params.post_id)
        return res.redirect('/posts/' + req.params.post_id.toString());
    if(document.body === '' && document.painting === '' && document.screenshot === '')
        return res.redirect('/titles/' + community.community_id + '/new');;
    const newPost = new POST(document);
    newPost.save();
    if(parentPost && (parentPost.pid !== PNID.pid))
        await util.data.newNotification({ pid: parentPost.pid, type: "reply", user: req.pid, link: `/posts/${parentPost.id}` });
    if(parentPost)
        res.redirect('/posts/' + req.params.post_id.toString());
    else
        res.redirect('/titles/' + community.community_id + '/new');
}

module.exports = router;

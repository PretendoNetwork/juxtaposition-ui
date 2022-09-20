var express = require('express');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const { POST } = require('../../../../models/post');
const rateLimit = require('../../../../middleware/ratelimit');
var multer  = require('multer');
var moment = require('moment');
var upload = multer({ dest: 'uploads/' });
const snowflake = require('node-snowflake').Snowflake;
var router = express.Router();

router.post('/empathy', rateLimit, async function (req, res) {
    let post = await database.getPostByID(req.body.postID);
    let userContent = await database.getUserContent(req.pid);
    if(!userContent)
        return res.sendStatus(423);
    if(req.body.type === 'up' && userContent.likes.indexOf(post.id) === -1 && userContent.pid !== post.pid)
    {
        post.upEmpathy();
        userContent.addToLikes(post.id)
        res.sendStatus(200);
        if(req.pid !== post.pid)
            await util.data.newNotification(post.pid, 0, post.id, req.pid);
    }
    else if(req.body.type === 'down' && userContent.likes.indexOf(post.id) !== -1 && userContent.pid !== post.pid)
    {
        post.downEmpathy();
        userContent.removeFromLike(post.id);
        res.sendStatus(200);
    }
    else
        res.sendStatus(423);
});

router.get('/:post_id', async function (req, res) {
    let userSettings = await database.getUserSettings(req.pid);
    let userContent = await database.getUserContent(req.pid);
    let post = await database.getPostByID(req.params.post_id.toString());
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
        mii_image_CDN: config.mii_image_CDN
    });
});

router.post('/:post_id/new', rateLimit, upload.none(), async function (req, res) { await newPost(req, res);});

router.post('/new', rateLimit, upload.none(), async function (req, res) { await newPost(req, res)});

async function newPost(req, res) {
    let PNID = await database.getPNID(req.pid), userSettings = await database.getUserSettings(req.pid), parentPost = null, postID = snowflake.nextId();
    let community = await database.getCommunityByID(req.body.olive_community_id);
    if(userSettings.account_status !== 0 || community.community_id === 'announcements')
        throw new Error('User not allowed to post')
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
    let appData = "", painting = "", paintingURI = "", screenshot = null;
    if (req.body.app_data)
        appData = req.body.app_data.replace(/\0/g, "").trim();
    if (req.body.painting && req.body.painting !== 'eJztwTEBACAMA7DCNRlIQRbu4ZoEviTJTNvjZNUFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL55fYLL3w==') {
        painting = req.body.painting.replace(/\0/g, "").trim();
        paintingURI = await util.data.processPainting(painting, true);
        await util.data.uploadCDNAsset('pn-cdn', `paintings/${req.pid}/${postID}.png`, paintingURI, 'public-read');
    }
    if (req.body.screenshot) {
        screenshot = req.body.screenshot.replace(/\0/g, "").trim();
        await util.data.uploadCDNAsset('pn-cdn', `screenshots/${req.pid}/${postID}.jpg`, Buffer.from(screenshot, 'base64'), 'public-read');
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
    const document = {
        title_id: community.title_id[0],
        community_id: community.community_id,
        screen_name: userSettings.screen_name,
        body: req.body.body,
        app_data: appData,
        painting: painting,
        screenshot: screenshot ? `/screenshots/${req.pid}/${postID}.jpg`: "",
        country_id: req.paramPackData ? req.paramPackData.country_id : 49,
        created_at: new Date(),
        feeling_id: req.body.emotion,
        id: postID,
        is_autopost: req.body.is_autopost,
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
    if(duplicatePost)
        return res.redirect('/posts/' + req.params.post_id.toString());
    const newPost = new POST(document);
    newPost.save();
    if(parentPost && (parentPost.pid !== PNID.pid)) {
        let newContent;
        if(!parentPost.body) {
            if(parentPost.screenshot)
                newContent = 'Screenshot Post';
            else if(parentPost.painting)
                newContent = 'Drawing Post';
        }
        else
            newContent = parentPost.body;
        await util.data.newNotification(parentPost.pid, 1, parentPost.id, req.pid, '', newContent);
    }
    if(parentPost)
        res.redirect('/posts/' + req.params.post_id.toString());
    else
        res.redirect('/communities/' + community.community_id + '/new');
}

module.exports = router;

const express = require('express');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const multer = require('multer');
const moment = require('moment');
const upload = multer({dest: 'uploads/'});
const router = express.Router();

router.get('/', async function (req, res) {
    let popularCommunities = await database.getMostPopularCommunities(9);
    let newCommunities = await database.getCommunities(6);
    res.render(req.directory + '/communities.ejs', {
        cache: true,
        popularCommunities: popularCommunities,
        newCommunities: newCommunities,
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid
    });
});

router.get('/all', async function (req, res) {
    let communities = await database.getCommunities(90);
    res.render(req.directory + '/all_communities.ejs', {
        communities: communities,
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid
    });
});

router.get('/announcements', async function (req, res) {
    let userSettings = await database.getUserSettings(req.pid);
    let userContent = await database.getUserContent(req.pid);
    let community = await database.getCommunityByID('announcements');
    let communityMap = await util.data.getCommunityHash();
    let posts = await database.getNumberNewCommunityPostsByID(community, config.post_limit);
    let totalNumPosts = await database.getTotalPostsByCommunity(community);
    res.render(req.directory + '/announcements.ejs', {
        moment: moment,
        community: community,
        posts: posts,
        communityMap: communityMap,
        userSettings: userSettings,
        userContent: userContent,
        totalNumPosts: totalNumPosts,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid
    });
});

router.get('/:communityID', async function (req, res) {
    res.redirect(`/titles/${req.params.communityID}/new`);
});

router.get('/:communityID/:type', async function (req, res) {
    let userSettings = await database.getUserSettings(req.pid);
    let userContent = await database.getUserContent(req.pid);
    if(req.params.communityID === 'announcements')
        res.redirect('/titles/announcements')
    let community = await database.getCommunityByID(req.params.communityID.toString());
    if(!community) return res.render(req.directory + '/error.ejs', {code: 404, message: "Community not Found", pid: req.pid, lang: req.lang, cdnURL: config.CDN_domain });
    let communityMap = await util.data.getCommunityHash();
    let posts, type;

    if(req.params.type === 'hot') {
        posts = await database.getNumberPopularCommunityPostsByID(community, config.post_limit);
        type = 1;
    } else if(req.params.type === 'verified') {
        posts = await database.getNumberVerifiedCommunityPostsByID(community, config.post_limit);
        type = 2;
    } else {
        posts = await database.getNewPostsByCommunity(community, config.post_limit);
        type = 0;
    }
    let numPosts = await database.getTotalPostsByCommunity(community)

    let bundle = {
        posts,
        numPosts,
        communityMap,
        userContent,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        link: `/titles/${req.params.communityID}/${req.params.type}/more?offset=${posts.length}&pjax=true`
    }

    if(req.query.pjax)
        return res.render(req.directory + '/partials/posts_list.ejs', {
            bundle,
            moment
        });

    res.render(req.directory + '/community.ejs', {
        // EJS variable and server-side variable
        moment: moment,
        community: community,
        communityMap: communityMap,
        posts: posts,
        totalNumPosts: numPosts,
        userSettings: userSettings,
        userContent: userContent,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid,
        type,
        bundle,
        template: 'posts_list',
    });
});

router.get('/:communityID/:type/more', async function (req, res) {
    let offset = parseInt(req.query.offset);
    let userSettings = await database.getUserSettings(req.pid);
    let userContent = await database.getUserContent(req.pid);
    let communityMap = await util.data.getCommunityHash();
    let posts;
    let community = await database.getCommunityByID(req.params.communityID)
    if(!community) return res.sendStatus(404);
    if(!offset)
        offset = 0;
    switch (req.params.type) {
        case 'popular':
            posts = await database.getNumberPopularCommunityPostsByID(community, config.post_limit, offset);
            break;
        case 'verified':
            posts = await database.getNumberVerifiedCommunityPostsByID(community, config.post_limit, offset);
            break;
        default:
            posts = await database.getNewPostsByCommunity(community, config.post_limit, offset);
            break;
    }

    let bundle = {
        posts,
        numPosts: posts.length,
        communityMap,
        userContent,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        link: `/titles/${req.params.communityID}/${req.params.type}/more?offset=${offset + posts.length}&pjax=true`
    }

    if(posts.length > 0)
    {
        res.render(req.directory + '/partials/posts_list.ejs', {
            communityMap: communityMap,
            moment: moment,
            database: database,
            bundle,
            account_server: config.account_server_domain.slice(8),
            cdnURL: config.CDN_domain,
            lang: req.lang,
            mii_image_CDN: config.mii_image_CDN,
            pid: req.pid
        });
    }
    else
        res.sendStatus(204);
});
// TODO: Remove the need for a parameter to toggle the following state
router.post('/follow', upload.none(), async function (req, res) {
    let community = await database.getCommunityByID(req.body.communityID);
    let userContent = await database.getUserContent(req.pid);
    if(userContent !== null && userContent.followed_communities.indexOf(community.community_id) === -1)
    {
        community.upFollower();
        userContent.addToCommunities(community.community_id);
        res.sendStatus(200);
    }
    else if(userContent !== null  && userContent.followed_communities.indexOf(community.community_id) !== -1)
    {
        community.downFollower();
        userContent.removeFromCommunities(community.community_id);
        res.sendStatus(200);
    }
    else
        res.sendStatus(423);
});

module.exports = router;

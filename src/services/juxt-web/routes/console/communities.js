var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
var multer  = require('multer');
var moment = require('moment');
var upload = multer({ dest: 'uploads/' });
var router = express.Router();

router.get('/', async function (req, res) {
    let popularCommunities = await database.getMostPopularCommunities(9);
    let newCommunities = await database.getCommunities(6);
    res.render(req.directory + '/communities.ejs', {
        cache: true,
        popularCommunities: popularCommunities,
        newCommunities: newCommunities,
        cdnURL: config.CDN_domain,
        lang: req.lang
    });
});

router.get('/all', async function (req, res) {
    let communities = await database.getCommunities(90);
    res.render(req.directory + '/all_communities.ejs', {
        communities: communities,
        cdnURL: config.CDN_domain,
        lang: req.lang
    });
});

router.get('/announcements', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let community = await database.getCommunityByID('announcements');
    let communityMap = await util.data.getCommunityHash();
    let newPosts = await database.getNumberNewCommunityPostsByID(community, config.post_limit);
    let totalNumPosts = await database.getTotalPostsByCommunity(community);
    res.render(req.directory + '/announcements.ejs', {
        moment: moment,
        community: community,
        newPosts: newPosts,
        communityMap: communityMap,
        user: user,
        totalNumPosts: totalNumPosts,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/:communityID', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    if(req.params.communityID === 'announcements')
        return res.redirect('/communities/announcements')
    let community = await database.getCommunityByID(req.params.communityID.toString());
    if(community === null && req.query.title_id)
        community = await database.getCommunityByTitleID(req.query.title_id)
    if(community === null)
        return res.sendStatus(404);
    let communityMap = await util.data.getCommunityHash();
    let newPosts = await database.getNumberNewCommunityPostsByID(community, config.post_limit);
    let totalNumPosts = await database.getTotalPostsByCommunity(community)
    res.render(req.directory + '/community.ejs', {
        // EJS variable and server-side variable
        moment: moment,
        community: community,
        communityMap: communityMap,
        newPosts: newPosts,
        totalNumPosts: totalNumPosts,
        user: user,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/:communityID/:type', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    if(req.params.communityID === 'announcements')
        res.redirect('/communities/announcements')
    let community = await database.getCommunityByID(req.params.communityID.toString());
    if(!community) return res.sendStatus(404);
    let communityMap = await util.data.getCommunityHash();
    let newPosts = await database.getNumberNewCommunityPostsByID(community, config.post_limit);
    let totalNumPosts = await database.getTotalPostsByCommunity(community)
    res.render(req.directory + '/community.ejs', {
        // EJS variable and server-side variable
        moment: moment,
        community: community,
        communityMap: communityMap,
        newPosts: newPosts,
        totalNumPosts: totalNumPosts,
        user: user,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/:communityID/:type/loadPosts', async function (req, res) {
    let offset = parseInt(req.query.offset);
    let user = await database.getUserByPID(req.pid);
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
    if(posts.length > 0)
    {
        res.render(req.directory + '/more_posts.ejs', {
            communityMap: communityMap,
            moment: moment,
            database: database,
            user: user,
            newPosts: posts,
            account_server: config.account_server_domain.slice(8),
            cdnURL: config.CDN_domain,
            lang: req.lang,
            mii_image_CDN: config.mii_image_CDN
        });
    }
    else
    {
        res.sendStatus(204);
    }
});

router.post('/follow', upload.none(), async function (req, res) {
    let community = await database.getCommunityByID(req.body.communityID);
    let user = await database.getUserByPID(req.pid);
    if(req.body.type === 'true' && user !== null && user.followed_communities.indexOf(community.community_id) === -1)
    {
        community.upFollower();
        user.addToCommunities(community.community_id);
        res.sendStatus(200);
    }
    else if(req.body.type === 'false' && user !== null  && user.followed_communities.indexOf(community.community_id) !== -1)
    {
        community.downFollower();
        user.removeFromCommunities(community.community_id);
        res.sendStatus(200);
    }
    else
        res.sendStatus(423);
});

module.exports = router;

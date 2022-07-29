var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
var moment = require('moment');
var router = express.Router();

router.get('/', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let communityMap = await util.data.getCommunityHash();
    let posts = await database.getNewsFeed(user, config.post_limit);
    res.render(req.directory + '/feed.ejs', {
        moment: moment,
        user: user,
        posts: posts,
        communityMap: communityMap,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/loadposts', async function (req, res) {
    let offset = parseInt(req.query.offset);
    let user = await database.getUserByPID(req.pid);
    let communityMap = await util.data.getCommunityHash();
    let posts;
    if(offset !== null)
        posts = await database.getNewsFeedOffset(user, config.post_limit, offset);
    if(posts === undefined)
        return res.sendStatus(204);
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

module.exports = router;

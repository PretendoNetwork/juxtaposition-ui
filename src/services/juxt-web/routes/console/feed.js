const express = require('express');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const moment = require('moment');
var router = express.Router();

router.get('/', async function (req, res) {
    let userContent = await database.getUserContent(req.pid);
    let communityMap = await util.data.getCommunityHash();
    let posts = await database.getNewsFeed(userContent, config.post_limit);
    res.render(req.directory + '/feed.ejs', {
        moment: moment,
        userContent: userContent,
        posts: posts,
        communityMap: communityMap,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid
    });
});

router.get('/loadposts', async function (req, res) {
    let offset = parseInt(req.query.offset);
    let userContent = await database.getUserContent(req.pid);
    let communityMap = await util.data.getCommunityHash();
    let posts;
    if(offset !== null)
        posts = await database.getNewsFeedOffset(userContent, config.post_limit, offset);
    if(posts === undefined)
        return res.sendStatus(204);
    if(posts.length > 0)
    {
        res.render(req.directory + '/more_posts.ejs', {
            communityMap: communityMap,
            moment: moment,
            database: database,
            userContent: userContent,
            newPosts: posts,
            account_server: config.account_server_domain.slice(8),
            cdnURL: config.CDN_domain,
            lang: req.lang,
            mii_image_CDN: config.mii_image_CDN,
            pid: req.pid
        });
    }
    else
    {
        res.sendStatus(204);
    }
});

module.exports = router;

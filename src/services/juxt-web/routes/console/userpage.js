const express = require('express');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const multer  = require('multer');
const moment = require('moment');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/menu', async function (req, res) {
    let user = await database.getUserSettings(req.pid);
    res.render('ctr/user_menu.ejs', {
        user: user,
    });
});

router.get('/me', async function (req, res) { await userPage(req, res, req.pid) });

router.get('/me/settings', async function (req, res) {
    let pnid = await database.getPNID(req.pid);
    let userSettings = await database.getUserSettings(req.pid);
    let communityMap = await util.data.getCommunityHash();
    res.render(req.directory + '/settings.ejs', {
        communityMap: communityMap,
        moment: moment,
        pnid: pnid,
        userSettings: userSettings,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid
    });
});

router.get('/me/:type', async function (req, res) { await userRelations(req, res, req.pid) });

router.post('/me/settings', upload.none(), async function (req, res) {
    let userSettings = await database.getUserSettings(req.pid);

    userSettings.country_visibility = !!req.body.country;
    userSettings.birthday_visibility = !!req.body.birthday;
    userSettings.game_skill_visibility = !!req.body.experience;
    userSettings.profile_comment_visibility = !!req.body.comment;

    if (req.body.comment)
        userSettings.updateComment(req.body.comment);
    else
        userSettings.updateComment('');

    res.redirect('/users/me');
});

router.get('/show', async function (req, res) {
   res.redirect(`/users/${req.query.pid}`);
});

router.get('/:pid/more', async function (req, res) { await morePosts(req, res, req.params.pid) });

router.get('/:pid/:type', async function (req, res) { await userRelations(req, res, req.params.pid) });

// TODO: Remove the need for a parameter to toggle the following state
router.post('/follow', upload.none(), async function (req, res) {
    let userToFollowContent = await database.getUserContent(req.body.id);
    let userContent = await database.getUserContent(req.pid);
    if(userContent !== null && userContent.followed_users.indexOf(userToFollowContent.pid) === -1)
    {
        userToFollowContent.addToFollowers(userContent.pid);
        userContent.addToUsers(userToFollowContent.pid);
        res.send({ status: 200, id: userToFollowContent.pid, count: userToFollowContent.following_users.length - 1 });
        let picked = await database.getNotification(userToFollowContent.pid, 2, userContent.pid);
        //pid, type, reference_id, origin_pid, title, content
        if(picked === null)
            await util.data.newNotification({ pid: userToFollowContent.pid, type: "follow", user: req.pid, link: `/users/show?pid=${req.pid}` });
    }
    else if(userContent !== null  && userContent.followed_users.indexOf(userToFollowContent.pid) !== -1)
    {
        userToFollowContent.removeFromFollowers(userContent.pid);
        userContent.removeFromUsers(userToFollowContent.pid);
        res.send({ status: 200, id: userToFollowContent.pid, count: userToFollowContent.following_users.length - 1 });
    }
    else
        res.send({ status: 423, id: userToFollowContent.pid, count: userToFollowContent.following_users.length - 1 });
});

router.get('/:pid', async function (req, res) {
    const userID = req.params.pid;
    if(userID === 'me' || Number(userID) === req.pid)
        return res.redirect('/users/me');
    await userPage(req, res, userID);
});

router.get('/:pid/:type', async function (req, res) {
    const userID = req.params.pid;
    if(userID === 'me' || Number(userID) === req.pid)
        return res.redirect('/users/me');
    await userRelations(req, res, userID);
});

async function userPage(req, res, userID) {
    let pnid = await database.getPNID(userID);
    let userContent = await database.getUserContent(userID);
    if(isNaN(userID) || !pnid || !userContent)
        return res.redirect('/404');
    let userSettings = await database.getUserSettings(userID);
    let posts = await database.getNumberUserPostsByID(userID, config.post_limit);
    let numPosts = await database.getTotalPostsByUserID(userID);
    let communityMap = await util.data.getCommunityHash();

    let bundle = {
        posts,
        numPosts,
        communityMap,
        userContent,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        link: `/users/${userID}/more?offset=${posts.length}&pjax=true`
    }

    if(req.query.pjax)
        return res.render(req.directory + '/partials/posts_list.ejs', {
            bundle,
            moment
        });
    let link = (pnid.pid === req.pid) ? '/users/me/' : `/users/${userID}/`;
    let parentUserContent;
    if(pnid.pid !== req.pid)
        parentUserContent = await database.getUserContent(req.pid);

    res.render(req.directory + '/user_page.ejs', {
        template: 'posts_list',
        selection: 0,
        moment,
        pnid,
        numPosts,
        userContent,
        userSettings,
        bundle,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid,
        link,
        parentUserContent
    });
}

async function userRelations(req, res, userID) {
    let pnid = await database.getPNID(userID);
    let userContent = await database.getUserContent(userID);
    if(isNaN(userID) || !pnid)
        return res.redirect('/404');

    let followers, communities, communityMap, selection;

    if(req.params.type === 'followers') {
        followers = await database.getFollowingUsers(userContent);
        communities = [];
        selection = 3;
    }
    else {
        followers = await database.getFollowedUsers(userContent);
        communities = userContent.followed_communities;
        communityMap = await util.data.getCommunityHash();
        selection = 2;
    }

    if(followers[0] === '0')
        followers.splice(0, 0);
    if(communities[0] === '0')
        communities.splice(0, 1);

    let bundle = {
        followers: followers,
        communities: communities,
        communityMap: communityMap
    }

    if(req.query.pjax)
        return res.render(req.directory + '/partials/following_list.ejs', {
            bundle,
        });

    let link = (pnid.pid === req.pid) ? '/users/me/' : `/users/${userID}/`;
    let userSettings = await database.getUserSettings(userID);
    let numPosts = await database.getTotalPostsByUserID(userID);
    let parentUserContent;
    if(pnid.pid !== req.pid)
        parentUserContent = await database.getUserContent(req.pid);
    res.render(req.directory + '/user_page.ejs', {
        template: 'following_list',
        selection: selection,
        moment,
        pnid,
        numPosts,
        userContent,
        userSettings,
        bundle,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid,
        link,
        parentUserContent
    });
}

async function morePosts(req, res, userID) {
    let offset = parseInt(req.query.offset);
    let userSettings = await database.getUserSettings(req.pid);
    let userContent = await database.getUserContent(req.pid);
    let communityMap = await util.data.getCommunityHash();
    let posts;
    if(!offset) offset = 0;
    posts = await database.getUserPostsOffset(userID, config.post_limit, offset);

    let bundle = {
        posts,
        numPosts: posts.length,
        communityMap,
        userContent,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN,
        link: `/users/${userID}/more?offset=${offset + posts.length}&pjax=true`
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
}
module.exports = router;

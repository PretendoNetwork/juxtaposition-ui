var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
var multer  = require('multer');
var moment = require('moment');
const {data} = require("../../../../util");
var upload = multer({ dest: 'uploads/' });
var router = express.Router();

router.get('/menu', async function (req, res) {
    let user = await database.getUserSettings(req.pid);
    res.render('ctr/user_menu.ejs', {
        user: user,
    });
});

router.get('/me', async function (req, res) {
    let pnid = await database.getPNID(req.pid);
    let userContent = await database.getUserContent(req.pid);
    let userSettings = await database.getUserSettings(req.pid);
    let newPosts = await database.getNumberUserPostsByID(req.pid, config.post_limit);
    let numPosts = await database.getTotalPostsByUserID(req.pid);
    let communityMap = await util.data.getCommunityHash();
    res.render(req.directory + '/me_page.ejs', {
        communityMap: communityMap,
        moment: moment,
        pnid: pnid,
        userContent: userContent,
        userSettings: userSettings,
        newPosts: newPosts,
        numPosts: numPosts,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.post('/me', upload.none(), async function (req, res) {
    let userSettings = await database.getUserSettings(req.pid);

    userSettings.country_visibility = !!req.body.country;
    userSettings.birthday_visibility = !!req.body.birthday;
    userSettings.game_skill_visibility = !!req.body.experience;
    userSettings.profile_comment_visibility = !!req.body.commentShow;

    if (req.body.comment)
        userSettings.updateComment(req.body.comment);
    else
        userSettings.updateComment('');

    res.redirect('/users/me');
});

router.get('/show', async function (req, res) {
    var userID = req.query.pid;
    if(userID === 'me') {
        res.sendStatus(504);
        return;
    }
    let parentUserContent = await database.getUserContent(req.pid);
    let pnid = await database.getPNID(userID);
    let userContent = await database.getUserContent(userID);
    let userSettings = await database.getUserSettings(userID);
    if(user === null)
        return res.sendStatus(404);
    if(parentUserContent.pid === user.pid)
        return res.redirect('/users/me');
    let newPosts = await database.getNumberUserPostsByID(user.pid, config.post_limit);
    let numPosts = await database.getTotalPostsByUserID(user.pid);
    let communityMap = await util.data.getCommunityHash();
    res.render(req.directory + '/user_page.ejs', {
        // EJS variable and server-side variable
        communityMap: communityMap,
        moment: moment,
        pnid: pnid,
        userContent: userContent,
        userSettings: userSettings,
        newPosts: newPosts,
        numPosts: numPosts,
        parentUserContent: parentUserContent,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/loadPosts', async function (req, res) {
    let offset = parseInt(req.query.offset);
    let pid;
    if(req.query.pid)
        pid = req.query.pid
    else
        pid = req.pid
    let userContent = await database.getUserContent(pid);
    let newPosts = await database.getUserPostsOffset(pid, config.post_limit, offset);
    let communityMap = await util.data.getCommunityHash();
    if(newPosts.length > 0)
    {
        res.render(req.directory + '/more_posts.ejs', {
            communityMap: communityMap,
            moment: moment,
            userContent: userContent,
            newPosts: newPosts,
            account_server: config.account_server_domain.slice(8),
            cdnURL: config.CDN_domain,
            lang: req.lang,
            mii_image_CDN: config.mii_image_CDN
        });
    }
    else
    {
        res.status(204)
        res.send('<p class="no-posts-text">' + req.lang.global.no_posts + '</p>')
    }
});

router.get('/following', async function (req, res) {
    let user = await database.getUserContent(req.query.pid);
    let followers = await database.getFollowedUsers(user);
    let communities = user.followed_communities;
    let communityMap = await util.data.getCommunityHash();

    if(followers[0] === '0')
        followers.splice(0, 0);
    if(communities[0] === '0')
        communities.splice(0, 1);

    if((followers.length + communities.length) > 0)
    {
        res.render(req.directory + '/following_list.ejs', {
            moment: moment,
            user: user,
            followers: followers,
            communities: communities,
            communityMap: communityMap,
            account_server: config.account_server_domain.slice(8),
            cdnURL: config.CDN_domain,
            lang: req.lang,
            mii_image_CDN: config.mii_image_CDN
        });
    }
    else
    {
        res.send('<p class="no-posts-text">' + req.lang.user_page.no_following + '</p>')
    }
});

router.get('/followers', async function (req, res) {
    let user = await database.getUserContent(req.query.pid);
    let followers = await database.getFollowingUsers(user);
    let communities = [];
    let userMap = await util.data.getUserHash();

    if(followers[0] === '0')
        followers.splice(0, 1);

    if(user.followers > 0)
    {
        res.render(req.directory + '/following_list.ejs', {
            moment: moment,
            user: user,
            followers: followers,
            communities: communities,
            userMap: userMap,
            account_server: config.account_server_domain.slice(8),
            cdnURL: config.CDN_domain,
            lang: req.lang,
            mii_image_CDN: config.mii_image_CDN
        });
    }
    else
    {
        res.send('<p class="no-posts-text">' + req.lang.user_page.no_followers + '</p>')
    }
});

router.get('/friends', async function (req, res) {
    let user = await database.getUserContent(req.query.pid);
    let friends = null;
    let userMap = await util.data.getUserHash();

    if(friends)
    {
        res.render(req.directory + '/following_list.ejs', {
            moment: moment,
            user: user,
            friends: friends,
            userMap: userMap,
            account_server: config.account_server_domain.slice(8),
            cdnURL: config.CDN_domain,
            lang: req.lang,
            mii_image_CDN: config.mii_image_CDN
        });
    }
    else
    {
        res.send('<p class="no-posts-text">' + req.lang.user_page.no_friends + '</p>')
    }
});

router.post('/follow', upload.none(), async function (req, res) {
    let userToFollowContent = await database.getUserContent(req.body.userID);
    let userContent = await database.getUserContent(req.pid);
    if(req.body.type === 'true' && userContent !== null && userContent.followed_users.indexOf(userToFollowContent.pid) === -1)
    {
        userToFollowContent.addToFollowers(userContent.pid);
        userContent.addToUsers(userToFollowContent.pid);
        res.sendStatus(200);
        let picked = await database.getNotification(userToFollowContent.pid, 2, userContent.pid);
        if(picked === undefined)
            await util.data.newNotification(userToFollowContent.pid, 2, `${userContent.user_id} NEW_FOLLOWER`, userContent.pid, `/users/show?pid=${userContent.pid}`)
    }
    else if(req.body.type === 'false' && userContent !== null  && userContent.followed_users.indexOf(userToFollowContent.pid) !== -1)
    {
        userToFollowContent.removeFromFollowers(userContent.pid);
        userContent.removeFromUsers(userToFollowContent.pid);
        res.sendStatus(200);
    }
    else
        res.sendStatus(423);
});

module.exports = router;

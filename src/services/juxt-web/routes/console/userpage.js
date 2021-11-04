var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
const config = require('../../../../config.json');
var multer  = require('multer');
var moment = require('moment');
var upload = multer({ dest: 'uploads/' });
var router = express.Router();

router.get('/menu', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    res.render('ctr/user_menu.ejs', {
        user: user,
    });
});

router.get('/me', async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let newPosts = await database.getNumberUserPostsByID(req.pid, 10);
    let numPosts = await database.getTotalPostsByUserID(req.pid);
    let communityMap = await util.data.getCommunityHash();
    res.render(req.directory + '/me_page.ejs', {
        communityMap: communityMap,
        moment: moment,
        user: user,
        newPosts: newPosts,
        numPosts: numPosts,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.post('/me', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.pid);

    user.country_visibility = !!req.body.country;
    user.birthday_visibility = !!req.body.birthday;
    user.game_skill_visibility = !!req.body.experience;
    user.profile_comment_visibility = !!req.body.commentShow;

    if (req.body.comment)
        user.setProfileComment(req.body.comment);
    else
        user.setProfileComment('');

    res.redirect('/users/me');
});

router.get('/show', async function (req, res) {
    var userID = req.query.pid;
    if(userID === 'me') {
        res.sendStatus(504);
        return;
    }
    let parentUser = await database.getUserByPID(req.pid);
    let user = await database.getUserByPID(userID);
    if(user === null)
        return res.sendStatus(404);
    if(parentUser.pid === user.pid)
        return res.redirect('/users/me');
    let newPosts = await database.getNumberUserPostsByID(user.pid, 10);
    let numPosts = await database.getTotalPostsByUserID(user.pid);
    let communityMap = await util.data.getCommunityHash();
    res.render(req.directory + '/user_page.ejs', {
        // EJS variable and server-side variable
        communityMap: communityMap,
        moment: moment,
        user: user,
        newPosts: newPosts,
        numPosts: numPosts,
        parentUser: parentUser,
        account_server: config.account_server_domain.slice(8),
        cdnURL: config.CDN_domain,
        lang: req.lang,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/loadPosts', async function (req, res) {
    let post = await database.getPostByID(req.query.postID);
    let user = await database.getUserByPID(req.pid);
    let newPosts = '';
    if(post !== null)
        newPosts = await database.getUserPostsAfterTimestamp(post, 10);
    else
        newPosts = await database.getNumberUserPostsByID(req.query.pid, 10);

    let communityMap = await util.data.getCommunityHash();
    if(newPosts.length > 0)
    {
        res.render(req.directory + '/more_posts.ejs', {
            communityMap: communityMap,
            moment: moment,
            user: user,
            newPosts: newPosts,
            account_server: config.account_server_domain.slice(8),
            cdnURL: config.CDN_domain,
            lang: req.lang,
            mii_image_CDN: config.mii_image_CDN
        });
    }
    else
    {
        res.sendStatus(204)
    }
});

router.get('/following', async function (req, res) {
    let user = await database.getUserByPID(req.query.pid);
    let followers = await database.getFollowedUsers(user);
    let communities = user.followed_communities;
    let communityMap = await util.data.getCommunityHash();

    if(user.followed_users[0] === '0')
        followers.splice(0, 1);
    if(communities[0] === '0')
        communities.splice(0, 1);

    if(user.following > 0)
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
    let user = await database.getUserByPID(req.query.pid);
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
    let user = await database.getUserByPID(req.query.pid);
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
    let userToFollow = await database.getUserByPID(req.body.userID);
    let user = await database.getUserByPID(req.pid);
    if(req.body.type === 'true' && user !== null && user.followed_users.indexOf(userToFollow.pid) === -1)
    {
        userToFollow.addToFollowers(user.pid);
        user.addToUsers(userToFollow.pid);
        res.sendStatus(200);
        await database.pushNewNotificationByPID(userToFollow.pid, user.user_id + ' ' + req.lang.notifications.new_follower, '/users/show?pid=' + user.pid)
    }
    else if(req.body.type === 'false' && user !== null  && user.followed_users.indexOf(userToFollow.pid) !== -1)
    {
        userToFollow.removeFromFollowers(user.pid);
        user.removeFromUsers(userToFollow.pid);
        res.sendStatus(200);
    }
    else
        res.sendStatus(423);
});

module.exports = router;

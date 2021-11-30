var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const logger = require('../../../../logger');
const util = require('../../../../authentication');
const config = require('../../../../config.json');
const request = require("request");
var path = require('path');
var moment = require('moment');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var router = express.Router();

router.get('/', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    res.render('admin/admin_home.ejs', {
        user: user,
        account_server: config.account_server_domain.slice(8),
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/css/juxt.css', function (req, res) {
    res.sendFile('css/juxt.css', {root: path.join(__dirname, '../../../../webfiles/admin/')});
});

router.get('/favicon.ico', function (req, res) {
    res.sendFile('css/favicon.ico', {root: path.join(__dirname, '../../../../webfiles/console/')});
});

router.get('/icons/:image_id.png', async function (req, res) {
    let community = await database.getCommunityByID(req.params.image_id.toString());
    if(community !== null) {
        if(community.browser_icon.indexOf('data:image/png;base64,') !== -1)
            res.send(Buffer.from(community.browser_icon.replace('data:image/png;base64,',''), 'base64'));
        else
            res.send(Buffer.from(community.browser_icon, 'base64'));
    }
    else {
        let user = await database.getUserByPID(req.params.image_id.toString());
        if(user !== null)
            if(user.pfp_uri.indexOf('data:image/png;base64,') !== -1)
                res.send(Buffer.from(user.pfp_uri.replace('data:image/png;base64,',''), 'base64'));
            else
                res.send(Buffer.from(user.pfp_uri, 'base64'));
        else
            res.sendStatus(404);
    }
});

router.get('/banner/:image_id.png', async function (req, res) {
    let community = await database.getCommunityByID(req.params.image_id.toString());
    if(community !== null)
        if(community.WiiU_browser_header.indexOf('data:image/png;base64,') !== -1)
            res.send(Buffer.from(community.WiiU_browser_header.replace('data:image/png;base64,',''), 'base64'));
        else
            res.send(Buffer.from(community.WiiU_browser_header, 'base64'));
    else
        res.sendStatus(404);
});

router.get('/discovery', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    res.render('admin/admin_discovery.ejs', {
        user: user,
        account_server: config.account_server_domain.slice(8),
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/communities', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let communities = await database.getCommunities(500)

    res.render('admin/admin_communities.ejs', {
        user: user,
        account_server: config.account_server_domain.slice(8),
        communities: communities,
        moment: moment,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/audit', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    res.render('admin/admin_audit.ejs', {
        user: user,
        account_server: config.account_server_domain.slice(8),
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/announcements', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let community = await database.getCommunityByID('announcements');
    let newPosts = await database.getNewPostsByCommunity(community, 500);
    let totalNumPosts = await database.getTotalPostsByCommunity(community);

    res.render('admin/admin_announcements.ejs', {
        community: community,
        newPosts: newPosts,
        totalNumPosts: totalNumPosts,
        user: user,
        account_server: config.account_server_domain.slice(8),
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/communities/new', upload.none(), async function (req, res) {
    var communityID = req.query.CID;
    let user = await database.getUserByPID(req.pid);
    res.render('admin/admin_new_community.ejs', {
        user: user,
        account_server: config.account_server_domain.slice(8),
        communityID: communityID,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/communities/:communityID', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let community = await database.getCommunityByID(req.params.communityID.toString());
    let newPosts = await database.getNewPostsByCommunity(community, 500);
    let totalNumPosts = await database.getTotalPostsByCommunity(community);

    res.render('admin/admin_community.ejs', {
        community: community,
        newPosts: newPosts,
        totalNumPosts: totalNumPosts,
        user: user,
        account_server: config.account_server_domain.slice(8),
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/communities/:communityID/edit', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let community = await database.getCommunityByID(req.params.communityID.toString());
    res.render('admin/admin_edit_community.ejs', {
        user: user,
        account_server: config.account_server_domain.slice(8),
        community: community,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/communities/:communityID/sub', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let communities = await database.getSubCommunities(req.params.communityID.toString());

    res.render('admin/admin_sub_communities.ejs', {
        user: user,
        account_server: config.account_server_domain.slice(8),
        communities: communities,
        moment: moment,
        communityID: req.params.communityID.toString(),
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/communities/:communityID/sub/new', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let community = await database.getCommunityByID(req.params.communityID.toString());
    res.render('admin/admin_edit_sub_community.ejs', {
        user: user,
        account_server: config.account_server_domain.slice(8),
        community: community,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/users', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let users = await database.getUsers(500);
    res.render('admin/admin_users.ejs', {
        user: user,
        account_server: config.account_server_domain.slice(8),
        users: users,
        moment: moment,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/users/:userID', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.params.userID);
    let parentUser =  await database.getUserByPID(req.pid)
    if(user === null)
        res.sendStatus(404);
    let newPosts = await database.getNumberUserPostsByID(req.params.userID, 500);
    let numPosts = await database.getTotalPostsByUserID(req.params.userID);
    let communityMap = await util.data.getCommunityHash();

    res.render('admin/admin_user.ejs', {
        communityMap: communityMap,
        moment: moment,
        parentUser: parentUser,
        user: user,
        account_server: config.account_server_domain.slice(8),
        newPosts: newPosts,
        numPosts: numPosts,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/users/:userID/edit', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.params.userID);
    let parentUser =  await database.getUserByPID(req.pid)
    if(user === null)
        res.sendStatus(404);
    let newPosts = await database.getNumberUserPostsByID(req.params.userID, 50);
    let numPosts = await database.getTotalPostsByUserID(req.params.userID);

    res.render('admin/admin_edit_user.ejs', {
        moment: moment,
        parentUser: parentUser,
        user: user,
        account_server: config.account_server_domain.slice(8),
        newPosts: newPosts,
        numPosts: numPosts,
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/posts/new', upload.none(), async function (req, res) {
    let user = await database.getUserByPID(req.pid);
    let community = await database.getCommunityByID('announcements');

    res.render('admin/admin_new_post.ejs', {
        community: community,
        user: user,
        account_server: config.account_server_domain.slice(8),
        mii_image_CDN: config.mii_image_CDN
    });
});

router.get('/login', upload.none(), async function (req, res) {
    if(req.cookies.token === undefined)
    {
        return res.render('admin/admin_login.ejs', {});
    }
    else
        res.redirect('/');
});

router.get('/token', upload.none(), async function (req, res) {
    let port;
    if(req.hostname.includes('miiverse'))
        port = 'http://'
    else
        port = 'https://'
    request.get({
        url: port + config.account_server_domain + "/v1/api/provider/service_token/@me",
        headers: {
            'X-Nintendo-Client-ID': config["X-Nintendo-Client-ID"],
            'X-Nintendo-Client-Secret': config["X-Nintendo-Client-Secret"],
            'X-Nintendo-Title-ID': req.headers['x-nintendo-title-id'],
            'authorization': req.headers['authorization'],
        }
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.send(body);
        }
        else
        {
            res.statusCode = 400;
            let response = {
                error_code: 400,
                message: 'Invalid account ID or password'
            };
            res.send(response);
        }

    });
});

router.post('/login', upload.none(), async function (req, res) {
    let port;
    if(req.hostname.includes('miiverse'))
        port = 'http://'
    else
        port = 'https://'
    let user_id = req.body.user_id;
    let user = await database.getUserByUsername(user_id);
    let pnid = await database.getPNID(user.pid)
    console.log(pnid)
    console.log(user.pid)
    let password = req.body.password;
    if(user !== null && password !== null && pnid !== null) {
        if(pnid.access_level !== 3) {
            logger.audit('[' + user.user_id + ' - ' + user.pid + '] is not authorized to access the application');
            res.statusCode = 403;
            let response = {
                error_code: 403,
                message: 'You are not authorized to access this application'
            };
            return res.send(response);
        }
        let password_hash = await util.data.nintendoPasswordHash(password, user.pid);
        await request.post({
            url: port + config.account_server_domain + "/v1/api/oauth20/access_token/generate",
            headers: {
                'X-Nintendo-Client-ID': config["X-Nintendo-Client-ID"],
                'X-Nintendo-Client-Secret': config["X-Nintendo-Client-Secret"],
                'X-Nintendo-Title-ID': '0005001010040100'
            },
            form: {
                user_id: user_id,
                password_type: 'hash',
                password: password_hash,
                grant_type: 'password'
            }
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                logger.audit('[' + user.user_id + ' - ' + user.pid + '] signed into the application');
                return res.send(body);
            }
            else {
                res.statusCode = 403;
                let response = {
                    error_code: 403,
                    message: 'Invalid account ID or password'
                };
                return res.send(response);
            }
        });
    }
    else {
        res.statusCode = 403;
        let response = {
            error_code: 403,
            message: 'Invalid account ID or password'
        };
        return res.send(response);
    }
});

module.exports = router;

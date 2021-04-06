var express = require('express');
const database = require('../../../../database');
const logger = require('../../../../logger');
const util = require('../../../../authentication');
const config = require('../../../../config.json');
const { COMMUNITY } = require('../../../../models/communities');
var router = express.Router();
const moment = require('moment');
var multer  = require('multer');
const snowflake = require('node-snowflake').Snowflake;
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.get('/communities/all', function (req, res) {
    database.connect().then(async e => {
        if(req.cookies.token === null)
            throw new Error('No service token supplied');

        let pid = util.data.processServiceToken(req.cookies.token);

        if(pid === null)
            throw new Error('Invalid credentials supplied');

        let user = await database.getUserByPID(pid);

        if(user !== null)
        {
            if(config.authorized_PNIDs.indexOf(user.pid) === -1)
                throw new Error('Invalid credentials supplied');

            res.send(await database.getCommunities(-1))
        }
        else
            throw new Error('Invalid account ID or password');

    }).catch(error =>
    {
        res.statusCode = 400;
        let response = {
            error_code: 400,
            message: error.message
        };
        res.send(response);
    });
});

router.get('/communities/:communityID', function (req, res) {
    database.connect().then(async e => {
        if(req.cookies.token === null)
            throw new Error('No service token supplied');

        let pid = util.data.processServiceToken(req.cookies.token);

        if(pid === null)
            throw new Error('Invalid credentials supplied');

        let user = await database.getUserByPID(pid);

        if(user !== null)
        {
            if(config.authorized_PNIDs.indexOf(user.pid) === -1)
                throw new Error('Invalid credentials supplied');

            res.send(await database.getCommunityByID(req.params.communityID))
        }
        else
            throw new Error('Invalid account ID or password');

    }).catch(error =>
    {
        res.statusCode = 400;
        let response = {
            error_code: 400,
            message: error.message
        };
        res.send(response);
    });
});

router.post('/communities/:communityID/delete', function (req, res) {
    database.connect().then(async e => {
        if(req.cookies.token === null)
            throw new Error('No service token supplied');

        let pid = util.data.processServiceToken(req.cookies.token);

        if(pid === null)
            throw new Error('Invalid credentials supplied');

        let user = await database.getUserByPID(pid);

        if(user !== null)
        {
            if(config.authorized_PNIDs.indexOf(user.pid) === -1) {
                logger.audit('[' + user.user_id + ' - ' + user.pid + '] attempted to delete a community and is not authorized');
                throw new Error('Invalid credentials supplied');
            }

            let community = await database.getCommunityByID(req.params.communityID);
            if(community !== null) {
                community.delete().then(err => function () {
                    res.send(err);
                });
                res.sendStatus(200);
                logger.audit('[' + user.user_id + ' - ' + user.pid + '] deleted community ' + community.name);
            }
        }
        else
            throw new Error('Invalid account ID or password');

    }).catch(error =>
    {
        res.statusCode = 400;
        let response = {
            error_code: 400,
            message: error.message
        };
        res.send(response);
    });
});

router.post('/communities/:communityID/update', upload.fields([{name: 'browserIcon', maxCount: 1}, { name: 'CTRbrowserHeader', maxCount: 1}, { name: 'WiiUbrowserHeader', maxCount: 1}]), function (req, res) {
    database.connect().then(async e => {
        if(req.cookies.token === null)
            throw new Error('No service token supplied');

        let pid = util.data.processServiceToken(req.cookies.token);

        if(pid === null)
            throw new Error('Invalid credentials supplied');

        let user = await database.getUserByPID(pid);

        if(user !== null)
        {
            if(config.authorized_PNIDs.indexOf(user.pid) === -1) {
                logger.audit('[' + user.user_id + ' - ' + user.pid + '] attempted to update a community and is not authorized');
                throw new Error('Invalid credentials supplied');
            }

            const community = await database.getCommunityByID(req.params.communityID);
            const files = JSON.parse(JSON.stringify(req.files));

            if(req.body.name && community.name !== req.body.name)
                community.name = req.body.name;

            if(req.body.description && community.description !== req.body.description)
                community.description = req.body.description;

            if(req.body.title_ids[0] !== community.title_ids[0] && req.body.title_ids[1] !== community.title_ids[1] && req.body.title_ids[2] !== community.title_ids[2]
            && req.body.title_ids[0] !== '' && req.body.title_ids[1] !== '' && req.body.title_ids[2] !== '') {
                community.title_id = req.body.title_ids;
                community.title_ids = req.body.title_ids;
            }

            if(req.body.icon && community.icon !== req.body.icon)
                community.icon = req.body.icon;

            if(req.files.browserIcon)
                community.browser_icon = `data:image/png;base64,${req.files.browserIcon[0].buffer.toString('base64')}`;

            if(req.files.CTRbrowserHeader)
                community.CTR_browser_header = `data:image/png;base64,${req.files.CTRbrowserHeader[0].buffer.toString('base64')}`;

            if(req.files.WiiUbrowserHeader)
                community.WiiU_browser_header = `data:image/png;base64,${req.files.WiiUbrowserHeader[0].buffer.toString('base64')}`;

            if(req.body.is_recommended)
                community.is_recommended = req.body.is_recommended;

            if(req.body.has_shop_page)
                community.has_shop_page = req.body.has_shop_page;

            if(req.body.platform_id)
                community.platform_id = req.body.platform_id;

            community.save();
            res.sendStatus(200);
            logger.audit('[' + user.user_id + ' - ' + user.pid + '] updated community ' + community.name);
        }
        else
            throw new Error('Invalid account ID or password');

    }).catch(error =>
    {
        res.statusCode = 400;
        let response = {
            error_code: 400,
            message: error.message
        };
        res.send(response);
    });
});

router.post('/communities/new', upload.fields([{name: 'browserIcon', maxCount: 1}, { name: 'CTRbrowserHeader', maxCount: 1}, { name: 'WiiUbrowserHeader', maxCount: 1}]), function (req, res) {
    database.connect().then(async e => {
        if(req.cookies.token === null)
            throw new Error('No service token supplied');

        let pid = util.data.processServiceToken(req.cookies.token);

        if(pid === null)
            throw new Error('Invalid credentials supplied');

        let user = await database.getUserByPID(pid);

        if(user !== null)
        {
            if(config.authorized_PNIDs.indexOf(user.pid) === -1) {
                logger.audit('[' + user.user_id + ' - ' + user.pid + '] attempted to create a community and is not authorized');
                throw new Error('Invalid credentials supplied');
            }

            JSON.parse(JSON.stringify(req.files));
            const document = {
                empathy_count: 0,
                id: snowflake.nextId(),
                has_shop_page: req.body.has_shop_page,
                platform_id: req.body.platform_ID,
                icon: req.body.icon,
                created_at: moment(new Date()),
                title_ids: req.body.title_ids,
                title_id: req.body.title_ids,
                community_id: snowflake.nextId(),
                is_recommended: req.body.is_recommended,
                name: req.body.name,
                browser_icon: `data:image/png;base64,${req.files.browserIcon[0].buffer.toString('base64')}`,
                CTR_browser_header: `data:image/png;base64,${req.files.CTRbrowserHeader[0].buffer.toString('base64')}`,
                WiiU_browser_header:  `data:image/png;base64,${req.files.WiiUbrowserHeader[0].buffer.toString('base64')}`,
                description: req.body.description,
            };
            const newCommunity = new COMMUNITY(document);
            newCommunity.save();
            res.sendStatus(200);
            logger.audit('[' + user.user_id + ' - ' + user.pid + '] created community ' + newCommunity.name);
        }
        else
            throw new Error('Invalid account ID or password');

    }).catch(error =>
    {
        res.statusCode = 400;
        let response = {
            error_code: 400,
            message: error.message
        };
        res.send(response);
    });
});

router.post('/discovery/update', upload.none(), function (req, res) {
    database.connect().then(async e => {
        if(req.cookies.token === null)
            throw new Error('No service token supplied');

        let pid = util.data.processServiceToken(req.cookies.token);

        if(pid === null)
            throw new Error('Invalid credentials supplied');

        let user = await database.getUserByPID(pid);

        if(user !== null)
        {
            if(config.authorized_PNIDs.indexOf(user.pid) === -1)
                throw new Error('Invalid credentials supplied');
            let endpoint = await database.getServerConfig();
            endpoint.has_error = req.body.has_error;
            endpoint.save();
            res.send(endpoint);
        }
        else
            throw new Error('Invalid account ID or password');

    }).catch(error =>
    {
        res.statusCode = 400;
        let response = {
            error_code: 400,
            message: error.message
        };
        res.send(response);
    });
});

router.get('/users/all', function (req, res) {
    database.connect().then(async e => {
        if(req.cookies.token === null)
            throw new Error('No service token supplied');

        let pid = util.data.processServiceToken(req.cookies.token);

        if(pid === null)
            throw new Error('Invalid credentials supplied');

        let user = await database.getUserByPID(pid);

        if(user !== null)
        {
            if(config.authorized_PNIDs.indexOf(user.pid) === -1)
                throw new Error('Invalid credentials supplied');

            res.send(await database.getUsers(-1))
        }
        else
            throw new Error('Invalid account ID or password');

    }).catch(error =>
    {
        res.statusCode = 400;
        let response = {
            error_code: 400,
            message: error.message
        };
        res.send(response);
    });
});

router.get('/users/:userID', function (req, res) {
    database.connect().then(async e => {
        if(req.cookies.token === null)
            throw new Error('No service token supplied');

        let pid = util.data.processServiceToken(req.cookies.token);

        if(pid === null)
            throw new Error('Invalid credentials supplied');

        let user = await database.getUserByPID(pid);

        if(user !== null)
        {
            if(config.authorized_PNIDs.indexOf(user.pid) === -1)
                throw new Error('Invalid credentials supplied');

            res.send(await database.getUserByPID(req.params.userID))
        }
        else
            throw new Error('Invalid account ID or password');

    }).catch(error =>
    {
        res.statusCode = 400;
        let response = {
            error_code: 400,
            message: error.message
        };
        res.send(response);
    });
});

router.post('/users/:userID/update', upload.none(), function (req, res) {
    database.connect().then(async e => {
        if(req.cookies.token === null)
            throw new Error('No service token supplied');

        let pid = util.data.processServiceToken(req.cookies.token);

        if(pid === null)
            throw new Error('Invalid credentials supplied');

        let parentUser = await database.getUserByPID(pid);
        let user = await database.getUserByPID(req.params.userID);

        if(user !== null)
        {
            if(config.authorized_PNIDs.indexOf(parentUser.pid) === -1)
                throw new Error('Invalid credentials supplied');
            user.account_status = req.body.account_status;
            user.ban_reason =  req.body.ban_reason;
            user.ban_lift_date = moment(req.body.ban_date);
            user.save();
            res.sendStatus(200);
            logger.audit('[' + parentUser.user_id + ' - ' + parentUser.pid + '] banned ' + user.user_id + ' until ' + user.ban_lift_date + ' for ' + user.ban_reason);
        }
        else
            throw new Error('Invalid account ID or password');

    }).catch(error =>
    {
        res.statusCode = 400;
        let response = {
            error_code: 400,
            message: error.message
        };
        res.send(response);
    });
});

router.post('/posts/:postID/delete', function (req, res) {
    database.connect().then(async e => {
        if(req.cookies.token === null)
            throw new Error('No service token supplied');

        let pid = util.data.processServiceToken(req.cookies.token);

        if(pid === null)
            throw new Error('Invalid credentials supplied');

        let user = await database.getUserByPID(pid);

        if(user !== null)
        {
            if(config.authorized_PNIDs.indexOf(user.pid) === -1) {
                logger.audit('[' + user.user_id + ' - ' + user.pid + '] attempted to delete a community and is not authorized');
                throw new Error('Invalid credentials supplied');
            }

            let post = await database.getPostByID(req.params.postID);
            if(post !== null) {
                post.delete().then(err => function () {
                    res.send(err);
                });
                res.sendStatus(200);
                logger.audit('[' + user.user_id + ' - ' + user.pid + '] deleted post by ' + post.screen_name);
            }
            else
                res.sendStatus(404)
        }
        else
            throw new Error('Invalid account ID or password');

    }).catch(error =>
    {
        res.statusCode = 400;
        let response = {
            error_code: 400,
            message: error.message
        };
        res.send(response);
    });
});

module.exports = router;
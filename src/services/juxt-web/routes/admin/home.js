var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
const config = require('../../../../config.json');
const request = require("request");
var path = require('path');
const ejs = require('ejs');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var router = express.Router();

var cookieParser = require('cookie-parser');
router.use(cookieParser());

router.get('/', upload.none(), function (req, res) {

    database.connect().then(async e => {

        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        if(req.cookies.token === null)
        {
            res.redirect('/login');
            return;
        }

        let pid = util.data.processServiceToken(req.cookies.token);
        //console.log(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
        {
            res.redirect('/login');
            return;
        }
        let user = await database.getUserByPID(pid);
        res.render('admin_home.ejs', {
            user: user,
        });

    }).catch(error => {
        console.log(error);
        res.set("Content-Type", "application/xml");
        res.statusCode = 400;
        response = {
            result: {
                has_error: 1,
                version: 1,
                code: 400,
                error_code: 15,
                message: "SERVER_ERROR"
            }
        };
        res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + xml(response));
    });

});

router.get('/css/juxt.css', function (req, res) {
    res.sendFile('css/juxt.css', {root: path.join(__dirname, '../../../../webfiles/admin/')});
});

router.get('/discovery', upload.none(), function (req, res) {

    database.connect().then(async e => {

        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        if(req.cookies.token === null)
        {
            res.redirect('/login');
            return;
        }

        let pid = util.data.processServiceToken(req.cookies.token);
        //console.log(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
        {
            res.redirect('/login');
            return;
        }
        let user = await database.getUserByPID(pid);
        res.render('admin_discovery.ejs', {
            user: user,
        });

    }).catch(error => {
        console.log(error);
        res.set("Content-Type", "application/xml");
        res.statusCode = 400;
        response = {
            result: {
                has_error: 1,
                version: 1,
                code: 400,
                error_code: 15,
                message: "SERVER_ERROR"
            }
        };
        res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + xml(response));
    });

});

router.get('/communities', upload.none(), function (req, res) {

    database.connect().then(async e => {

        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        if(req.cookies.token === null)
        {
            res.redirect('/login');
            return;
        }

        let pid = util.data.processServiceToken(req.cookies.token);
        //console.log(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
        {
            res.redirect('/login');
            return;
        }
        let user = await database.getUserByPID(pid);
        res.render('admin_communities.ejs', {
            user: user,
        });

    }).catch(error => {
        console.log(error);
        res.set("Content-Type", "application/xml");
        res.statusCode = 400;
        response = {
            result: {
                has_error: 1,
                version: 1,
                code: 400,
                error_code: 15,
                message: "SERVER_ERROR"
            }
        };
        res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + xml(response));
    });

});

router.get('/audit', upload.none(), function (req, res) {

    database.connect().then(async e => {

        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        if(req.cookies.token === null)
        {
            res.redirect('/login');
            return;
        }

        let pid = util.data.processServiceToken(req.cookies.token);
        //console.log(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
        {
            res.redirect('/login');
            return;
        }
        let user = await database.getUserByPID(pid);
        res.render('admin_audit.ejs', {
            user: user,
        });

    }).catch(error => {
        console.log(error);
        res.set("Content-Type", "application/xml");
        res.statusCode = 400;
        response = {
            result: {
                has_error: 1,
                version: 1,
                code: 400,
                error_code: 15,
                message: "SERVER_ERROR"
            }
        };
        res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + xml(response));
    });

});

router.get('/communities/new', upload.none(), function (req, res) {

    database.connect().then(async e => {

        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        if(req.cookies.token === null)
        {
            res.redirect('/login');
            return;
        }

        let pid = util.data.processServiceToken(req.cookies.token);
        //console.log(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
        {
            res.redirect('/login');
            return;
        }
        let user = await database.getUserByPID(pid);
        res.render('admin_new_community.ejs', {
            user: user,
        });

    }).catch(error => {
        console.log(error);
        res.set("Content-Type", "application/xml");
        res.statusCode = 400;
        response = {
            result: {
                has_error: 1,
                version: 1,
                code: 400,
                error_code: 15,
                message: "SERVER_ERROR"
            }
        };
        res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + xml(response));
    });

});

router.get('/communities/:communityID/edit', upload.none(), function (req, res) {

    database.connect().then(async e => {
        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        if(req.cookies.token === null)
        {
            res.redirect('/login');
            return;
        }

        let pid = util.data.processServiceToken(req.cookies.token);
        //console.log(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
        {
            res.redirect('/login');
            return;
        }
        let user = await database.getUserByPID(pid);
        let community = await database.getCommunityByID(req.params.communityID.toString());
        res.render('admin_edit_community.ejs', {
            user: user,
            community: community,
        });

    }).catch(error => {
        console.log(error);
        res.set("Content-Type", "application/xml");
        res.statusCode = 400;
        response = {
            result: {
                has_error: 1,
                version: 1,
                code: 400,
                error_code: 15,
                message: "SERVER_ERROR"
            }
        };
        res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + xml(response));
    });

});

router.get('/communities/:communityID', upload.none(), function (req, res) {

    database.connect().then(async e => {
        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        if(req.cookies.token === null)
        {
            res.redirect('/login');
            return;
        }

        let pid = util.data.processServiceToken(req.cookies.token);
        //console.log(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
        {
            res.redirect('/login');
            return;
        }
        let user = await database.getUserByPID(pid);
        let community = await database.getCommunityByID(req.params.communityID.toString());
        let newPosts = await database.getNewPostsByCommunity(community, 100);
        let totalNumPosts = await database.getTotalPostsByCommunity(community);

        res.render('admin_community.ejs', {
            community: community,
            newPosts: newPosts,
            totalNumPosts: totalNumPosts,
            user: user
        });

    }).catch(error => {
        console.log(error);
        res.set("Content-Type", "application/xml");
        res.statusCode = 400;
        response = {
            result: {
                has_error: 1,
                version: 1,
                code: 400,
                error_code: 15,
                message: "SERVER_ERROR"
            }
        };
        res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + xml(response));
    });

});

router.get('/users', upload.none(), function (req, res) {

    database.connect().then(async e => {

        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        if(req.cookies.token === null)
        {
            res.redirect('/login');
            return;
        }

        let pid = util.data.processServiceToken(req.cookies.token);
        //console.log(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
        {
            res.redirect('/login');
            return;
        }
        let user = await database.getUserByPID(pid);
        res.render('admin_users.ejs', {
            user: user,
        });

    }).catch(error => {
        console.log(error);
        res.set("Content-Type", "application/xml");
        res.statusCode = 400;
        response = {
            result: {
                has_error: 1,
                version: 1,
                code: 400,
                error_code: 15,
                message: "SERVER_ERROR"
            }
        };
        res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + xml(response));
    });

});

router.get('/login', upload.none(), function (req, res) {

    database.connect().then(async e => {

        //let paramPackData = util.data.decodeParamPack(req.headers["x-nintendo-parampack"]);
        if(req.cookies.token === null)
        {
            res.render('admin_login.ejs', {});
            return;
        }

        let pid = util.data.processServiceToken(req.cookies.token);
        //console.log(req.headers["x-nintendo-servicetoken"]);
        if(pid === null)
        {
            res.render('admin_login.ejs', {});
            return;
        }
        let user = await database.getUserByPID(pid);
        res.redirect('/');

    }).catch(error => {
        console.log(error);
        res.set("Content-Type", "application/xml");
        res.statusCode = 400;
        response = {
            result: {
                has_error: 1,
                version: 1,
                code: 400,
                error_code: 15,
                message: "SERVER_ERROR"
            }
        };
        res.send("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + xml(response));
    });

});

router.get('/token', upload.none(), function (req, res) {
    request.get({
        url: "http://" + config.account_server_domain + "/v1/api/provider/service_token/@me",
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

router.post('/login', upload.none(), function (req, res) {
    database.connect().then(async e => {
        let user_id = req.body.user_id;
        let user = await database.getUserByUsername(user_id);
        let password = req.body.password;
        if(user !== null && password !== null)
        {
            if(config.authorized_PNIDs.indexOf(user.pid) === -1)
                throw new Error('User is not authorized to access the application');
            let password_hash = await util.data.nintendoPasswordHash(password, user.pid);
            console.log(password_hash)
            await request.post({
                url: "http://" + config.account_server_domain + "/v1/api/oauth20/access_token/generate",
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
                    res.send(body);
                }
                else
                {
                    console.log(body)
                    res.statusCode = 400;
                    let response = {
                        error_code: 400,
                        message: 'Invalid account ID or password'
                    };
                    res.send(response);
                }

            });
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

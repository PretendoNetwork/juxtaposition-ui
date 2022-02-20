var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
const database = require('../../../../database');
const util = require('../../../../util');
var path = require('path');
const config = require("../../../../config.json");
const request = require("request");
const logger = require("../../../../logger");

router.get('/', async function (req, res) {
    res.render(req.directory + '/login.ejs');
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    let user = await database.getUserByUsername(username);
    if(!user) {
        res.cookie('error', 'User not found.', { domain: '.pretendo.cc' });
        return res.redirect('/account/login');
    }
    let password_hash = await util.data.nintendoPasswordHash(password, user.pid);
    let auth, token;
    await request.post({
        url: `https://${config.account_server_domain}/v1/api/oauth20/access_token/generate`,
        headers: {
            'X-Nintendo-Client-ID': config["X-Nintendo-Client-ID"],
            'X-Nintendo-Client-Secret': config["X-Nintendo-Client-Secret"],
            'X-Nintendo-Title-ID': '0005001010040100'
        },
        form: {
            user_id: username,
            password_type: 'hash',
            password: password_hash,
            grant_type: 'password'
        }
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            logger.audit('[' + user.user_id + ' - ' + user.pid + '] signed into the application');
            parseString(body, async function (err, result) {
                auth = result.OAuth20.access_token[0].token[0];
                await request.get({
                    url: 'https://' + config.account_server_domain + "/v1/api/provider/service_token/@me",
                    headers: {
                        'X-Nintendo-Client-ID': config["X-Nintendo-Client-ID"],
                        'X-Nintendo-Client-Secret': config["X-Nintendo-Client-Secret"],
                        'X-Nintendo-Title-ID': '000500301001610A',
                        'authorization': `Bearer ${auth}`,
                    }
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        parseString(body, async function (err, result) {
                            token = result.service_token.token[0];
                            res.cookie('access_token', token, { domain : '.pretendo.cc' });
                            res.redirect('/activity-feed');
                        });
                    }
                    else
                    {
                        console.log(error);
                    }
                });
            });
        }
        else {
            res.statusCode = 403;
            let response = {
                error_code: 403,
                message: 'Invalid account ID or passwordrrrrrrr'
            };
            return res.send(response);
        }
    });
});


module.exports = router;

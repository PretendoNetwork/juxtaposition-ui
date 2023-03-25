const express = require('express');
const router = express.Router();
const parseString = require('xml2js').parseString;
const database = require('../../../../database');
const util = require('../../../../util');
const config = require("../../../../../config.json");
const request = require("request");
const logger = require("../../../../logger");

router.get('/', async function (req, res) {
    res.render(req.directory + '/login.ejs', {toast: null, cdnURL: config.CDN_domain,});
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    let user = await database.getUserByUsername(username);
    if(!user) {
        return res.render(req.directory + '/login.ejs', {toast: 'Invalid username or password.', cdnURL: config.CDN_domain,});
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
                            let PNID = await database.getPNID(user.pid);
                            let discovery = await database.getEndPoint(PNID.server_access_level);
                            let message = '';
                            switch (discovery.status) {
                                case 3:
                                    message = "Juxt is currently undergoing maintenance. Please try again later.";
                                    break;
                                case 4:
                                    message = "Juxt is currently closed. Thank you for your interest.";
                                    break;
                                default:
                                    message = "Juxt is currently unavailable. Please try again later.";
                                    break;
                            }
                            if(discovery.status !== 0) {
                                return res.render(req.directory + '/error.ejs', {
                                    code: 504,
                                    message: message,
                                    cdnURL: config.CDN_domain,
                                    lang: req.lang,
                                    pid: req.pid
                                });
                            }
                            if(!result.service_token)
                                return res.render(req.directory + '/login.ejs', {toast: 'Invalid username or password.', cdnURL: config.CDN_domain,});
                            token = result.service_token.token[0];
                            let cookieDomain = (req.hostname === 'juxt.miiverse.cc') ? '.miiverse.cc' : '.pretendo.network';
                            res.cookie('access_token', token, { domain : cookieDomain });
                            res.redirect('/');
                        });
                    }
                    else
                        return res.render(req.directory + '/login.ejs', {toast: 'Invalid username or password.', cdnURL: config.CDN_domain,});
                });
            });
        }
        else
            return res.render(req.directory + '/login.ejs', {toast: 'Invalid username or password.', cdnURL: config.CDN_domain,});
    });
});


module.exports = router;

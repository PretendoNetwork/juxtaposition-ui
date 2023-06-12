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
    const login = await util.data.login(username, password).catch((e) => {
        console.log(e.details);
        switch (e.details) {
            case 'INVALID_ARGUMENT: User not found':
                res.render(req.directory + '/login.ejs', {toast: 'Username was invalid.', cdnURL: config.CDN_domain,});
                break;
            case 'INVALID_ARGUMENT: Password is incorrect':
                res.render(req.directory + '/login.ejs', {toast: 'Password was incorrect.', cdnURL: config.CDN_domain,});
                break;
            default:
                res.render(req.directory + '/login.ejs', {toast: 'Invalid username or password.', cdnURL: config.CDN_domain,});
                break;
        }
    });
    if(!login) return;

    const PNID = await util.data.getUserData(login.accessToken);
    if(!PNID)
        return res.render(req.directory + '/login.ejs', {toast: 'Invalid username or password.', cdnURL: config.CDN_domain,});

    const pid = PNID.pid;

    let discovery = await database.getEndPoint(PNID.serverAccessLevel);
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
            pid: pid
        });
    }
    let cookieDomain = (req.hostname === 'juxt.miiverse.cc') ? '.miiverse.cc' : '.pretendo.network';
    res.cookie('access_token', login.accessToken, { domain : cookieDomain, maxAge: login.expiresIn * 60 });
    res.cookie('refresh_token', login.refreshToken, { domain : cookieDomain });
    res.redirect('/');
    /*let password_hash = await util.data.nintendoPasswordHash(password, user.pid);
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

                });
            });
        }
        else
            return res.render(req.directory + '/login.ejs', {toast: 'Invalid username or password.', cdnURL: config.CDN_domain,});
    });*/
});


module.exports = router;

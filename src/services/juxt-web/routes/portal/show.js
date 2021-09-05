var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
const config = require('../../../../config.json');
var moment = require('moment');
var router = express.Router();

router.get('/', function (req, res) {
    res.header('X-Nintendo-WhiteList', config.whitelist);
    let lang = util.data.processLanguage(req.headers["x-nintendo-parampack"]);
    database.connect().then(async e => {
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);
        let user = null;
        if(pid === null)
        {
            res.render('portal/guest_notice.ejs', {
                cdnURL: config.CDN_domain,
                lang: lang,
            });
        }
        else
        {
            user = await database.getUserByPID(pid);
            if(user === null)
            {
                res.render('portal/first_run.ejs', {
                    cdnURL: config.CDN_domain,
                    lang: lang,
                });
            }
            else {
                if(moment(user.ban_lift_date).format('YYYY-MM-DD') <= moment().format('YYYY-MM-DD') && user.account_status !== 3) {
                    user.account_status = 0;
                    user.save()
                }
                /**
                 * Account Status
                 * 0 - Fine
                 * 1 - Limited from Posting
                 * 2 - Temporary Ban
                 * 3 - Forever Ban
                 */
                if(user.account_status !== 0)
                {
                    res.render('portal/ban_notification.ejs', {
                        user: user,
                        moment: moment,
                        cdnURL: config.CDN_domain,
                        lang: lang,
                    });
                }
                else
                {
                    let popularCommunities = await database.getMostPopularCommunities(9);
                    let newCommunities = await database.getNewCommunities(6);
                    res.render('portal/communities.ejs', {
                        popularCommunities: popularCommunities,
                        newCommunities: newCommunities,
                        cdnURL: config.CDN_domain,
                        lang: lang
                    });
                }
            }

        }
    }).catch(error => {
        console.log(error)
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

router.get('/first', function (req, res) {
    res.header('X-Nintendo-WhiteList', config.whitelist);
    let lang = util.data.processLanguage(req.headers["x-nintendo-parampack"]);
    res.render('portal/first_run.ejs', {
        cdnURL: config.CDN_domain,
        lang: lang,
    });
});

router.post('/newUser', function (req, res) {
    database.connect().then(async e => {
        let pid = util.data.processServiceToken(req.headers["x-nintendo-servicetoken"]);
        let user = null;
        if(pid === null)
        {
            res.sendStatus(401);
        }
        else
        {
            user = await database.getUserByPID(pid);
            if(user === null)
            {
                await util.data.create_user(pid, req.body.experience, req.body.notifications, req.body.region);
                util.data.refreshCache();
                if(await database.getUserByPID(pid) !== null)
                    res.sendStatus(200);
                else
                    res.sendStatus(504);
            }
            else
            {
                res.sendStatus(504);
            }
        }
    }).catch(error => {
        console.log(error)
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

module.exports = router;

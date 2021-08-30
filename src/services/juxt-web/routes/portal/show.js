var express = require('express');
var xml = require('object-to-xml');
const database = require('../../../../database');
const util = require('../../../../authentication');
const config = require('../../../../config.json');
var moment = require('moment');
var router = express.Router();

router.get('/', function (req, res) {
    res.header('X-Nintendo-WhiteList','1|http,youtube.com,,2|https,youtube.com,,2|http,.youtube.com,,2|https,.youtube.com,,2|http,.ytimg.com,,2|https,.ytimg.com,,2|http,.googlevideo.com,,2|https,.googlevideo.com,,2|https,youtube.com,/embed/,6|https,youtube.com,/e/,6|https,youtube.com,/v/,6|https,www.youtube.com,/embed/,6|https,www.youtube.com,/e/,6|https,www.youtube.com,/v/,6|https,youtube.googleapis.com,/e/,6|https,youtube.googleapis.com,/v/,6|http,maps.googleapis.com,/maps/api/streetview,2|https,maps.googleapis.com,/maps/api/streetview,2|http,cbk0.google.com,/cbk,2|https,cbk0.google.com,/cbk,2|http,cbk1.google.com,/cbk,2|https,cbk1.google.com,/cbk,2|http,cbk2.google.com,/cbk,2|https,cbk2.google.com,/cbk,2|http,cbk3.google.com,/cbk,2|https,cbk3.google.com,/cbk,2|https,.cloudfront.net,,2|https,www.google-analytics.com,/,2|https,stats.g.doubleclick.net,,2|https,www.google.com,/ads/,2|https,ssl.google-analytics.com,,2|http,fonts.googleapis.com,,2|fonts.googleapis.com,,2|https,www.googletagmanager.com,,2|http,miiverse.cc,,2|https,miiverse.cc,,2');
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
                        lang: lang,
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
    res.header('X-Nintendo-WhiteList','1|http,youtube.com,,2|https,youtube.com,,2|http,.youtube.com,,2|https,.youtube.com,,2|http,.ytimg.com,,2|https,.ytimg.com,,2|http,.googlevideo.com,,2|https,.googlevideo.com,,2|https,youtube.com,/embed/,6|https,youtube.com,/e/,6|https,youtube.com,/v/,6|https,www.youtube.com,/embed/,6|https,www.youtube.com,/e/,6|https,www.youtube.com,/v/,6|https,youtube.googleapis.com,/e/,6|https,youtube.googleapis.com,/v/,6|http,maps.googleapis.com,/maps/api/streetview,2|https,maps.googleapis.com,/maps/api/streetview,2|http,cbk0.google.com,/cbk,2|https,cbk0.google.com,/cbk,2|http,cbk1.google.com,/cbk,2|https,cbk1.google.com,/cbk,2|http,cbk2.google.com,/cbk,2|https,cbk2.google.com,/cbk,2|http,cbk3.google.com,/cbk,2|https,cbk3.google.com,/cbk,2|https,.cloudfront.net,,2|https,www.google-analytics.com,/,2|https,stats.g.doubleclick.net,,2|https,www.google.com,/ads/,2|https,ssl.google-analytics.com,,2|http,fonts.googleapis.com,,2|fonts.googleapis.com,,2|https,www.googletagmanager.com,,2|http,pretendo.cc,,2|https,pretendo.cc,,2');
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

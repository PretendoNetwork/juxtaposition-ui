const express = require('express');
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');

const moment = require('moment');
const { data } = require("../../../../util");
const router = express.Router();

router.get('/', async function (req, res) {
    try {
        if(req.pid === 1000000000) {
            res.render(req.directory + '/guest_notice.ejs', {
                cdnURL: config.CDN_domain,
                lang: req.lang,
            });
        }
        else {
            let user = await database.getUserSettings(req.pid);
            if(user === null)
            {
                res.render(req.directory + '/first_run.ejs', {
                    cdnURL: config.CDN_domain,
                    lang: req.lang,
                    pid: req.pid
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
                if(user.access_level === -1)
                {
                    res.render(req.directory + '/ban_notification.ejs', {
                        user: user,
                        moment: moment,
                        cdnURL: config.CDN_domain,
                        lang: req.lang,
                        pid: req.pid
                    });
                }
                else
                {
                    let popularCommunities = await database.getMostPopularCommunities(9);
                    let newCommunities = await database.getNewCommunities(6);
                    res.render(req.directory + '/communities.ejs', {
                        popularCommunities: popularCommunities,
                        newCommunities: newCommunities,
                        cdnURL: config.CDN_domain,
                        lang: req.lang,
                        pid: req.pid
                    });
                    let pnid = await database.getPNID(req.pid);
                    let usrMii = await database.getUserContent(req.pid);
                    if(pnid.mii.name !== usrMii.screen_name)
                        util.data.setName(req.pid)
                }
            }

        }
    }
    catch (e) {
        console.log(e)
    }
});

router.get('/first', async function (req, res) {
    res.render(req.directory + '/first_run.ejs', {
        cdnURL: config.CDN_domain,
        lang: req.lang,
    });
});

router.post('/newUser', async function (req, res) {
    if(req.pid === null)
    {
        res.sendStatus(401);
    }
    else
    {
        let user = await database.getUserSettings(req.pid);
        if(user === null)
        {
            await util.data.create_user(req.pid, req.body.experience, req.body.notifications, req.body.region);
            if(await database.getUserSettings(req.pid) !== null)
                res.sendStatus(200);
            else
                res.sendStatus(504);
        }
        else
        {
            res.sendStatus(504);
        }
    }
});

module.exports = router;

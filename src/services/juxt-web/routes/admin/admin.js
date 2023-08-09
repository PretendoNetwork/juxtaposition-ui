const express = require('express');
const database = require('../../../../database');
const { POST } = require('../../../../models/post');
const util = require('../../../../util');
const moment = require('moment');
const config = require("../../../../../config.json");
const router = express.Router();

router.get('/', async function (req, res) {
    if(!req.moderator)
        return res.redirect('/login');

    const reports = await database.getAllReports();
    const communityMap = await util.data.getCommunityHash();
    const userContent = await database.getUserContent(req.pid);
    const userMap = util.data.getUserHash();
    const postIDs = reports.map(obj => obj.post_id);

    const posts = await POST.aggregate([
        { $match: { id: { $in: postIDs } } },
        {$addFields: {
                "__order": { $indexOfArray: [ postIDs, "$id" ] }
            }},
        { $sort: { "__order": 1 } },
        { $project: { index: 0, _id: 0 } }
    ]);

    res.render(req.directory + '/reports.ejs', {
        lang: req.lang,
        moment: moment,
        cdnURL: config.CDN_domain,
        mii_image_CDN: config.mii_image_CDN,
        pid: req.pid,
        moderator: req.moderator,
        userMap,
        communityMap,
        userContent,
        reports,
        posts
    });
});

module.exports = router;

var express = require('express');
var router = express.Router();
const database = require('../../../../database');
var path = require('path');

router.get('/css/juxt.css', function (req, res) {
    res.sendFile('css/juxt.css', {root: path.join(__dirname, '../../../../webfiles/portal/')});
});

router.get('/js/juxt.js', function (req, res) {
    res.sendFile('js/juxt.js', {root: path.join(__dirname, '../../../../webfiles/portal/')});
});

router.get('/fonts/Poppins-Light.woff', function (req, res) {
    res.sendFile('fonts/Poppins-Light.woff', {root: path.join(__dirname, '../../../../webfiles/portal/')});
});

router.get('/fonts/Poppins-Light.ttf', function (req, res) {
    res.sendFile('fonts/Poppins-Light.ttf', {root: path.join(__dirname, '../../../../webfiles/portal/')});
});

router.get('/icons/:image_id.png', function (req, res) {
    database.connect().then(async e => {
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
    }).catch(error => {
        console.error(error);
        res.sendStatus(404)
    });
});

router.get('/banner/:image_id.png', function (req, res) {
    database.connect().then(async e => {
        let community = await database.getCommunityByID(req.params.image_id.toString());
        if(community !== null)
            if(community.WiiU_browser_header.indexOf('data:image/png;base64,') !== -1)
                res.send(Buffer.from(community.WiiU_browser_header.replace('data:image/png;base64,',''), 'base64'));
            else
                res.send(Buffer.from(community.WiiU_browser_header, 'base64'));
        else
            res.sendStatus(404);
    }).catch(error => {
        console.error(error);
        res.sendStatus(404)
    });
});

module.exports = router;

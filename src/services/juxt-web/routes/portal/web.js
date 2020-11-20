var express = require('express');
var router = express.Router();
var path = require('path');

/* GET discovery server. */
router.get('/css/juxt.css', function (req, res) {
    res.sendFile('css/juxt.css', {root: path.join(__dirname, '../../../../webfiles/portal/')});
});

router.get('/js/juxt.js', function (req, res) {
    res.sendFile('js/juxt.js', {root: path.join(__dirname, '../../../../webfiles/portal/')});
});

router.get('/icons/Icon-feather-search.svg', function (req, res) {
    res.sendFile('icons/Icon-feather-search.svg', {root: path.join(__dirname, '../../../../webfiles/portal/')})
});

router.get('/icons/mario-kart.jpg', function (req, res) {
    res.sendFile('icons/mario-kart.jpg', {root: path.join(__dirname, '../../../../webfiles/portal/')});
});

module.exports = router;

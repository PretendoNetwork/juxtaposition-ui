import express from 'express';
import path from 'path';

const router = express.Router();

router.get('/', function (req, res) {
	res.redirect('/titles/show');
});

router.get('/css/:filename', function (req, res) {
	res.set('Content-Type', 'text/css');
	res.sendFile('/css/' + req.params.filename, {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/js/:filename', function (req, res) {
	res.set('Content-Type', 'application/javascript; charset=utf-8');
	res.sendFile('/js/' + req.params.filename, {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/images/:filename', function (req, res) {
	res.set('Content-Type', 'image/png');
	res.sendFile('/images/' + req.params.filename, {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/fonts/:filename', function (req, res) {
	res.set('Content-Type', 'font/woff');
	res.sendFile('/fonts/' + req.params.filename, {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/favicon.ico', function (req, res) {
	res.set('Content-Type', 'image/x-icon');
	res.sendFile('/images/favicon.ico', {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

export default router;

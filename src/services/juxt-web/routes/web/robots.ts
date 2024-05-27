import path from 'path';
import express from 'express';

const router = express.Router();

router.get('/', function (req, res) {
	res.set('Content-Type', 'text/css');
	res.sendFile('robots.txt', {root: path.join(__dirname, '../../../../webfiles/web')});
});

export default router;
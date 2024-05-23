import path from 'path';
import express from 'express';

const router = express.Router();

router.get('/icons/:filename', function (req, res) {
	res.set('Content-Type', 'image/png');
	res.sendFile('/images/icons/' + req.params.filename, {root: path.join(__dirname, '../../../../webfiles/web')});
});

router.get('/manifest.json', function (req, res) {
	res.set('Content-Type', 'text/json');
	res.sendFile('manifest.json', {root: path.join(__dirname, '../../../../webfiles/web')});
});

export default router;
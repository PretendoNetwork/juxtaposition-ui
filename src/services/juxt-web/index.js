const express = require('express');
const subdomain = require('express-subdomain');
const logger = require('../../logger');
const routes = require('./routes');
const auth = require('../../middleware/auth');

const router = express.Router();
const console = express.Router();

// Create subdomains
logger.info('[JUXT-WEB] Creating \'Web\' subdomain');
router.use(subdomain('juxt', console));
router.use(subdomain('juxt-beta', console));
router.use(subdomain('juxt-dev', console));

logger.info('[JUXT-WEB] Creating \'Wii U\' subdomain');
router.use(subdomain('portal.olv', console));
router.use(subdomain('portal-beta.olv', console));
router.use(subdomain('portal-dev.olv', console));


logger.info('[JUXT-WEB] Creating \'3DS\' subdomain');
router.use(subdomain('ctr.olv', console));
router.use(subdomain('ctr-beta.olv', console));
router.use(subdomain('ctr-dev.olv', console));

// Setup routes
console.use('/titles/show', auth, routes.PORTAL_SHOW);
console.use('/titles', auth, routes.PORTAL_COMMUNITIES);
console.use('/communities', auth, routes.PORTAL_COMMUNITIES);
console.use('/topics', auth, routes.PORTAL_TOPICS);
console.use('/users', auth, routes.PORTAL_USER);
console.use('/posts', auth, routes.PORTAL_POST);
console.use('/feed', auth, routes.PORTAL_FEED);
console.use('/friend_messages', auth, routes.PORTAL_MESSAGES);
console.use('/news', auth, routes.PORTAL_NEWS);
console.use('/', routes.PORTAL_WEB);
console.use('/login', auth, routes.WEB_LOGIN);
console.use('/robots.txt', routes.ROBOTS);
console.use('/web', routes.PWA);
console.use('/admin', auth, routes.ADMIN);

module.exports = router;

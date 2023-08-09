const express = require('express');
const subdomain = require('express-subdomain');
const logger = require('../../logger');
const routes = require('./routes');

const router = express.Router();
const console = express.Router();

// Create subdomains
logger.info('[JUXT-WEB] Creating \'Web\' subdomain');
router.use(subdomain('juxt', console));

logger.info('[JUXT-WEB] Creating \'Wii U\' subdomain');
router.use(subdomain('portal.olv', console));

logger.info('[JUXT-WEB] Creating \'3DS\' subdomain');
router.use(subdomain('ctr.olv', console));

// Setup routes
console.use('/titles/show', routes.PORTAL_SHOW);
console.use('/titles', routes.PORTAL_COMMUNITIES);
console.use('/communities', routes.PORTAL_COMMUNITIES);
console.use('/topics', routes.PORTAL_TOPICS);
console.use('/users', routes.PORTAL_USER);
console.use('/posts', routes.PORTAL_POST);
console.use('/feed', routes.PORTAL_FEED);
console.use('/friend_messages', routes.PORTAL_MESSAGES);
console.use('/news', routes.PORTAL_NEWS);
console.use('/', routes.PORTAL_WEB);
console.use('/login', routes.WEB_LOGIN);
console.use('/robots.txt', routes.ROBOTS);
console.use('/web', routes.PWA);
console.use('/admin', routes.ADMIN);

module.exports = router;

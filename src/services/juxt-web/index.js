const express = require('express');
const subdomain = require('express-subdomain');
const logger = require('../../logger');
const routes = require('./routes');

const router = express.Router();

const portal = express.Router();
const ctr = express.Router();
const admin = express.Router();
const web_api = express.Router();

// Create subdomains
logger.info('[JUXT-WEB] Creating \'Wii U\' subdomain');
router.use(subdomain('portal.olv', portal));

logger.info('[JUXT-WEB] Creating \'3DS\' subdomain');
router.use(subdomain('ctr.olv', ctr));

logger.info('[JUXT-WEB] Creating \'Admin\' subdomain');
router.use(subdomain('admin.olv', admin));

logger.info('[JUXT-WEB] Creating \'Web API\' subdomain');
router.use(subdomain('web_api.olv', admin));

// Setup routes
portal.use('/titles/show', routes.PORTAL_SHOW);
portal.use('/communities', routes.PORTAL_COMMUNITIES);
portal.use('/users', routes.PORTAL_USER);
portal.use('/posts', routes.PORTAL_POST);
portal.use('/activity-feed', routes.PORTAL_FEED);
portal.use('/news', routes.PORTAL_NEWS);
portal.use('/', routes.PORTAL_WEB);

ctr.use('/titles/show', routes.CTR_SHOW);
ctr.use('/communities', routes.CTR_COMMUNITIES);
ctr.use('/users', routes.CTR_USER);
ctr.use('/', routes.CTR_WEB);

admin.use('/', routes.WEB_ADMIN);
admin.use('/v1/', routes.WEB_API);

module.exports = router;
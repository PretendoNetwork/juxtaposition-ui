const config = require('../../config.json');
const util = require('../util');

async function auth(request, response, next) {
    // Web files
    if(request.path.includes('/css/') || request.path.includes('/fonts/') || request.path.includes('/js/') || request.path === '/favicon.ico') {
        if(request.subdomains.includes('juxt'))
            request.directory = 'web';
        else
            request.directory = request.subdomains[1];
        return next()
    }
    // Juxt Website
    if(request.subdomains.includes('juxt')) {
        request.lang = util.data.processLanguage();
        request.token = request.cookies.access_token;
        request.pid = request.cookies.access_token ? await util.data.getPid(request.cookies.access_token) : null;
        request.paramPackData = null;
        request.directory = 'web';
        // Open access pages
        if(request.path.includes('/users/') ||
            (request.path.includes('/titles/') && request.path !== '/titles/show') ||
            (request.path.includes('/posts/') && !request.path.includes('/empathy'))) {
            if(!request.pid)
                request.pid = 1000000000;
            return next();
        }
        // Login endpoint
        if(request.path === '/login') {
            if(request.pid)
                return response.redirect('/titles/show?src=login');
            return next();
        }
        if(!request.pid)
            return response.redirect('/login');

        return next();
    }
    else {
        request.pid = request.headers["x-nintendo-servicetoken"] ? await util.data.processServiceToken(request.headers["x-nintendo-servicetoken"]) : null;
        request.paramPackData = request.headers["x-nintendo-parampack"] ? util.data.decodeParamPack(request.headers["x-nintendo-parampack"]) : null;
        response.header('X-Nintendo-WhiteList', config.whitelist);

        if(!request.pid) {
            return response.render('portal/partials/ban_notification.ejs', {
                user: null,
                error: "Unable to parse service token. Are you using a Nintendo Network ID?"
            });
        }
        if(!request.paramPackData) {
            return response.render('portal/partials/ban_notification.ejs', {
                user: null,
                error: "Missing auth headers"
            });
        }

        request.lang = util.data.processLanguage(request.paramPackData);
        request.directory = request.subdomains[1];
        return next();
    }
}

module.exports = auth;

const config = require('../config.json');
const util = require('../util');

function auth(request, response, next) {
    if(request.path.includes('/css/') || request.path.includes('/fonts/')
        || request.path.includes('/js/') || request.path.includes('/icons/') || request.path.includes('/banner/') || request.path.includes('/posts/')) {
        if(request.subdomains.indexOf('juxt') !== -1) {
            request.directory = 'web';
            request.lang = util.data.processLanguage();
        }
        else {
            request.directory = request.subdomains[1];
        }
        return next()
    }

    if(request.subdomains.indexOf('juxt') !== -1) {
        request.directory = 'web';
        if(request.path === '/login' || request.path === '/favicon.ico') {
            return next()
        }
        else {
            if(request.cookies.access_token === undefined || request.cookies.access_token === null)
            {
                return response.redirect('/login');
            }
            let pid = util.data.processServiceToken(request.cookies.access_token);
            if(pid === null)
            {
                return response.redirect('/login');
            }
            else {
                request.lang = util.data.processLanguage();
                request.pid = pid;
                request.paramPackData = null;
                request.directory = 'web';
                return next();
            }
        }
    }

    if(request.subdomains.indexOf('admin') !== -1) {
        if(request.path === '/login' || request.path === '/token' || request.path === '/favicon.ico') {
            return next()
        }
        else {
            if(request.cookies.token === undefined || request.cookies.token === null)
            {
                return response.redirect('/login');
            }
            let pid = util.data.processServiceToken(request.cookies.token);
            if(pid === null)
            {
                return response.redirect('/login');
            }
            else {
                request.pid = pid;
                return next();
            }
        }
    }
    else {
        if(!request.headers["x-nintendo-parampack"] || !request.headers["x-nintendo-servicetoken"]) {
            return response.render('portal/ban_notification.ejs', {
                user: null,
                error: "Missing auth headers"
            });
        }
        else {
            let pid = util.data.processServiceToken(request.headers["x-nintendo-servicetoken"]);
            let paramPackData = util.data.decodeParamPack(request.headers["x-nintendo-parampack"]);
            if(pid === null) {
                return response.render('portal/ban_notification.ejs', {
                    user: null,
                    error: "Unable to parse service token. Are you using a Nintendo Network ID?"
                });
            }

            else {
                response.header('X-Nintendo-WhiteList', config.whitelist);
                request.lang = util.data.processLanguage(request.headers["x-nintendo-parampack"]);
                request.pid = pid;
                request.paramPackData = paramPackData;
                request.directory = request.subdomains[1];
                return next();
            }
        }
    }
}

module.exports = auth;

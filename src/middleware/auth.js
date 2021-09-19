const config = require('../config.json');
const util = require('../authentication');

function auth(request, response, next) {
    if(!request.headers["x-nintendo-parampack"] || !request.headers["x-nintendo-servicetoken"]) {
        return response.render('console/ban_notification.ejs', {
            user: null,
            error: "Missing auth headers"
        });
    }
    else {
        let pid = util.data.processServiceToken(request.headers["x-nintendo-servicetoken"]);
        let paramPackData = util.data.decodeParamPack(request.headers["x-nintendo-parampack"]);
        if(pid === null)
            return response.render('console/ban_notification.ejs', {
                user: null,
                error: "Unable to parse service token. Are you using a NNID?"
            });
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

module.exports = auth;
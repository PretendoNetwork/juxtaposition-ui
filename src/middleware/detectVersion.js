const util = require('../util');

async function detectVersion(request, response, next) {
	// Check the domain and set the directory
	if (includes(request, 'juxt')) {
		request.directory = 'web';
		request.lang = util.data.processLanguage();
	} else {
		request.directory = includes(request, 'portal') ? 'portal' : 'ctr';
	}
	next();
}

function includes(request, domain) {
	return request.subdomains.findIndex(element => element.includes(domain)) !== -1;
}

module.exports = detectVersion;

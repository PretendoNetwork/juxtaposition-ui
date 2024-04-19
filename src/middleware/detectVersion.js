const util = require('../util');

async function detectVersion(request, response, next) {
	request.timerDate = Date.now();
	console.time(`Time Request ${request.timerDate}`);
	// Check the domain and set the directory
	if (includes(request, 'juxt')) {
		request.directory = 'web';
		request.lang = util.processLanguage();
	} else {
		request.directory = includes(request, 'portal') ? 'portal' : 'ctr';
	}
	next();
}

function includes(request, domain) {
	return request.subdomains.findIndex(element => element.includes(domain)) !== -1;
}

module.exports = detectVersion;

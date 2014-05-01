// Require the library
var http = require('http'),
	Solrz = require('../index'),
	solrz = new Solrz();

// Create rest routes for collection
var profile = solrz.rest('profile', {
	schema: require('./schema/profile.json'),
	views: {
		"public": require('./views/public/profile.json'),
		"private": require('./views/private/profile.json')
	}
});

// Listen for incoming calls against the profile collection
profile.on('read', 'in', function (payload, data, callback) {
	payload.view('public');
	callback(false, payload, data);
});

profile.on('read', 'out', function (payload, data, callback) {
	callback(false, payload, data);
});

profile.on('create', 'in', function (payload, data, callback) {
	data = {
		"firstName": "Test",
		"lastName": "Person"
	};
	
	callback(false, payload, data);
});

profile.on('create', 'in', function (payload, data, callback) {
	callback(false, payload, data);
});

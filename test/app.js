// Require the library
var http = require('http'),
	Solrz = require('../index'),
	solrz = new Solrz({
		/*"server": {
			"public": {
				"host": "localhost",
				"port": 80,
				"ssl": {
					"enable": false,
					"key": "./localhost.key",
					"cert": "./localhost.crt"
				}
			}
		},*/
		/*"db": {
			"connect": "mongodb://localhost/",
			"options": {}
		}*/
	});

// Create rest routes for collection
var profile = solrz.rest('profile', {
	schema: require('./schema/profile.json'),
	views: {
		"public/profile": require('./views/public/profile.json'),
		"private/profile": require('./views/private/profile.json')
	}
});

// Listen for incoming calls against the profile collection
profile.on('read', 'in', function (payload, data, callback) {
	payload.view('public/profile');
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
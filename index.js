var App = function (options) {
	require('./boot');
	this.Rest = require('./app/Rest');
	this.mongoose = require('mongoose');
	this.express = require('express');
	this.router = this.express();
	
	options = options || {};
	
	// Set server defaults if nothing passed
	if (!options.server) {
		options.server = {
			"public": {
				"host": "localhost",
				"port": 80
			}
		};
	}
	
	// Set db defaults if nothing passed
	if (!options.db) {
		options.db = {
			"connect": "mongodb://localhost/",
			"options": {}
		};
	}
	
	if (options.server instanceof Object) {
		// Create our own server from passed options
		this.serverCreate(options.server);
		this.serverStart(options.server);
	} else {
		// Use passed server
		this.router = this.express(options.server);
	}
	
	this.router.use(this.express.json());
	this.router.use(this.express.urlencoded());
	
	this.dbConnect(options.db);
};

App.prototype.dbConnect = function (options) {
	this.mongoose.connect(options.connect, options.options);
};

App.prototype.serverCreate = function (options) {
	if (options.ssl && options.ssl.enable) {
		var https = require('https'),
			ssl = {
				key: this._fs.readFileSync(options.ssl.key),
				cert: this._fs.readFileSync(options.ssl.cert)
			};
		
		this.publicServer = https.createServer(this._ssl, this.router);
	} else {
		var http = require('http');
		this.publicServer = http.createServer(this.router);
	}
};

App.prototype.serverStart = function (options) {
	this.publicServer.listen(options.public.port, options.public.host);
	console.log('Server Start');
};

App.prototype.rest = function (collection, options) {
	return new this.Rest(this.router, this.mongoose)
		.init(collection, options);
};

module.exports = App;
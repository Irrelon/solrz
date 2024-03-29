var Rest = function (router, db) {
	var self = this;
	this.Payload = require('./Payload');
	this.async = require('async');
	
	this.db = db;
	this.router = router;
	
	this._io = {};
	this._views = {};
	
	this.types = this.db.Schema.Types;
	this.ObjectId = this.db.Types.ObjectId;
};

Rest.prototype.before = function (index, action, dir, method) {
	if (arguments.length === 2) {
		method = dir;
		dir = action;
		action = 'global';
	}
	
	this._io[action][dir].splice(index, 0, method);
	
	return this;
};

Rest.prototype.on = function (action, dir, method) {
	if (arguments.length === 2) {
		method = dir;
		dir = action;
		action = 'global';
	}
	
	this._io[action][dir].push(method);
	
	return this;
};

Rest.prototype.after = function (index, action, dir, method) {
	if (arguments.length === 2) {
		method = dir;
		dir = action;
		action = 'global';
	}
	
	this._io[action][dir].splice(index, 0, method);
	
	return this;
};

Rest.prototype.off = function (action, dir, method) {
	if (arguments.length === 2) {
		method = dir;
		dir = action;
		action = 'global';
	}
	
	this._io[action][dir].pull(method);
	
	return this;
};

/**
 * Generates rest API paths for the passed collection.
 * @param {String} collection The name of the database collection.
 * @param {Object=} options
 */
Rest.prototype.init = function (collection, options) {
	var self = this,
		schema,
		i;
	
	if (!options) {
		options = {};
	}
	
	this._setupCollectionIo(collection);
	
	// Process passed schema
	var schemaJson = options.schema;
	
	// Process passed views
	if (options.views) {
		for (i in options.views) {
			if (options.views.hasOwnProperty(i)) {
				this._views[i] = options.views[i];
			}
		}
	}
	
	if (options.processMethods) {
		// Override default processing methods with any passed
		
	}
	
	this._io.collectionSchema = this.db.Schema(schema, {collection: collection});
	this._io.collectionModel = this.db.model(collection, this._io.collectionSchema);
	
	this.router.post('/' + collection, function (req, res) {
		self._requestIo('create', req, res, function (payload, data, callback) {
			// Run insert on the collection
			callback(false, payload, data);
		});
	});
	
	// Read
	this.router.get('/' + collection + '/:_id?', function (req, res) {
		self._requestIo('read', req, res);
	});
	
	// Update
	this.router.put('/' + collection + '/:_id?', function (req, res) {
		self._requestIo('update', req, res, function (payload, data, callback) {
			// Update the collection or item
			callback(false, payload, data);
		});
	});
	
	// Delete
	this.router.delete('/' + collection + '/:_id?', function (req, res) {
		self._requestIo('delete', req, res, function (payload, data, callback) {
			// Delete the collection or item
			callback(false, payload, data);
		});
	});
	
	return this;
};

Rest.prototype._requestIo = function (action, req, res) {
	var self = this,
		callArr = [function (callback) {
			callback(false, new self.Payload({
				"body": req.body || {},
				"query": req.query || {},
				"params": req.params || {},
				"res": res,
				"req": req
			}), {});
		}]
		.concat(self._io[action]['in'])
		.concat(self._io[action]['build'])
		.concat(self._io[action]['process'])
		.concat(self._io[action]['out'])
		.concat(self._io[action]['send']);
	
	self.async.waterfall(callArr, function (err, payload, data) {});
};

Rest.prototype._setupCollectionIo = function (collection) {
	var self = this;
	self._io = {
		"global": {
			"in": [],
			"build": [],
			"process": [],
			"out": [],
			"send": []
		},
		"create": {
			"in": [],
			"build": [],
			"process": [],
			"out": [],
			"send": []
		},
		"read": {
			"in": [],
			"build": [function (payload, data, callback) {
				// Build query
				if (payload.params._id) {
					// Limit to id
					payload.db = {
						query: {
							_id: new self.ObjectId(payload.params._id)
						},
						options: {}
					};
				} else {
					// Query all
					payload.db = {
						query: {},
						options: {}
					};
				}
				
				callback(false, payload, data);
			}],
			"process": [function (payload, data, callback) {
				var viewColumns = self._views[payload.view()] || "";
				
				// Query the collection
				self._io.collectionModel.find(payload.db.query, viewColumns, function (err, data) {
					// Pass result back to processor
					callback(false, payload, data);
				});
			}],
			"out": [],
			"send": [function (payload, data, callback) {
				payload.res.send(data);
				
				// Pass result back to processor
				callback(false, payload, data);
			}]
		},
		"update": {
			"in": [],
			"build": [],
			"process": [],
			"out": [],
			"send": []
		},
		"delete": {
			"in": [],
			"build": [],
			"process": [],
			"out": [],
			"send": []
		}
	};
};

Rest.prototype.serialiseViewJson = function (obj) {
	var str = '', i;
	
	for (i in obj) {
		if (obj.hasOwnProperty(i)) {
			if (obj[i] === 1) {
				if (str) { str += ' '; }
				str += i;
			}
		}
	}
	
	return str;
};

module.exports = Rest;
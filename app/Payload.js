var Payload = function (obj) {
	this._view = 'public';
	
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			this[i] = obj[i];
		}
	}
};

Payload.prototype.view = function (val) {
	if (val !== undefined) {
		this._view = val;
		return this;
	}
	
	return this._view;
};

module.exports = Payload;
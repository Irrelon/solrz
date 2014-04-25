var Payload = function (obj) {
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			this[i] = obj[i];
		}
	}
};

Payload.prototype.view = function (val) {
	if (val !== undefined) {
		this.view = val;
		return this;
	}
	
	return this.view;
};

module.exports = Payload;
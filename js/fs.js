var {FileUtil} = require('NativeModules');

var fs = Object.keys(FileUtil).reduce((o, method) => {
	o[method] = function (...args) {
		return new Promise((resolve, reject) => {
			return FileUtil[method].apply(FileUtil, args.concat(reject, resolve));
		});
	}
	return o;
}, {});

module.exports = fs;

var {AsyncStorage} = require('react-native');
var slice = [].slice;

function get(cb) {
	AsyncStorage.getItem('progress', (e, progress) => {
		if (e) {
			return cb(e);
		}
		try {
			progress = JSON.parse(progress)
		} catch (e) {};
		cb(null, progress)
	});
}
function set(key, val) {
	get((e, progress) => {
		if (e) {
			return;
		}
		if (!progress) {
			progress = {};
		}
		progress[key] = val;
		AsyncStorage.setItem('progress', JSON.stringify(progress));
	});
}

function setForCurrent(key, val) {
	get((e, progress) => {
		if (e) {
			return;
		}
		if (!progress.books) {
			progress.books = {};
		}
		var current = progress.books[progress.currentBook] = progress.books[progress.currentBook] || {};
		current[key] = val;
		AsyncStorage.setItem('progress', JSON.stringify(progress));
	});
}

module.exports = {
	get: get,
	set: set,
	setForCurrent: setForCurrent
};

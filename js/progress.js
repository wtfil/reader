var {AsyncStorage} = require('react-native');
var slice = [].slice;

async function get() {
	var p = await AsyncStorage.getItem('progress');
	return JSON.parse(p);
}

async function set(key, val) {
	var p = await get();
	p = p || {};
	p[key] = val;
	return AsyncStorage.setItem('progress', JSON.stringify(p));
}

async function setForCurrent(key, val) {
	var p = await get();
	p.books = p.books || {};
	var current = p.books[progress.currentBook] = p.books[progress.currentBook] || {};
	current[key] = val;
	return AsyncStorage.setItem('progress', JSON.stringify(p));
}

module.exports = {
	get: get,
	set: set,
	setForCurrent: setForCurrent
};

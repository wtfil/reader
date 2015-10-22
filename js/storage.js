var {AsyncStorage} = require('react-native');

async function get(path) {
	var chunks = path.split('..');
	var head = chunks.shift();
	var root, key;
	try {
		root = await AsyncStorage.getItem(head);
		root = JSON.parse(root);
	} catch (e) {
		return null;
	};
	for (key of chunks) {
		if (!root) {
			return null;
		}
		root = root[key];
	}
	return root;
}

async function set(path, val) {
	var chunks = path.split('..');
	var head = chunks.shift();
	if (!chunks.length) {
		return AsyncStorage.setItem(head, JSON.stringify(val));
	}
	var tail = chunks.pop();
	var root = await get(head);
	var cursor = root;
	var key;
	for (key of chunks) {
		if (!cursor[key]) {
			cursor[key] = {};
		}
		cursor = cursor[key];
	}
	cursor[tail] = val;
	return AsyncStorage.setItem(head, JSON.stringify(root));
}

module.exports = {get, set};

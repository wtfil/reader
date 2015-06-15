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
		root = root[key];
		if (!root) {
			return null;
		}
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
	var key;
	for (key of chunks) {
		if (!root) {
			root = {};
		}
		root = root[key];
	}
	root[tail] = val;
	return AsyncStorage.setItem(head, JSON.stringify(root));
}

module.exports = {get, set};

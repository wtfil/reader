var {AsyncStorage} = require('react-native');
var dictionary = require('./translate-en-ru-clean.json');

function translate({text}) {
	return dictionary[text.toLowerCase()];
}
function save({text, translated}) {
	AsyncStorage.getItem('translations', (e, translations) => {
		try {
			translations = JSON.parse(translations) || {};
		} catch (e) {
			translations = {};
		};
		if (!translations[text]) {
			translations[text] = {
				translated: translated,
				from: 'en',
				to: 'ru',
				counter: 0
			};
		}
		translations[text].counter ++;
		translations[text].lastTime = Date.now();
		AsyncStorage.setItem('translations', JSON.stringify(translations));
	})
}
function translateAndSave(opts) {
	var translated = translate(opts);
	save(Object.assign({translated: translated}, opts));
	return translated;
}
function getItems(cb) {
	AsyncStorage.getItem('translations', (err, items) => {
		if (err) {
			return cb(err);
		}
		items = JSON.parse(items);
		items = Object.keys(items).map(key => {
			return Object.assign({
				original: key
			}, items[key]);
		});
		cb(null, items);
	});
}

module.exports = translateAndSave;
module.exports.getItems = getItems;

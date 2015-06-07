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
				counter: 0
			};
		}
		translations[text].counter ++;
		AsyncStorage.setItem('translations', JSON.stringify(translations));
	})
}
function translateAndSave(opts) {
	var translated = translate(opts);
	save(Object.assign({translated: translated}, opts));
	return translated;
}

module.exports = translateAndSave;

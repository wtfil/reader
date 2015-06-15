var storage = require('./storage');
var dictionary = require('./translate-en-ru-clean.json');

function translate({text}) {
	return dictionary[text.toLowerCase()];
}
async function save({text, translated}) {
	var translations;
	try {
		translations = await storage.get('translations');
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

	return storage.set('translations', translations);
}

function translateAndSave(opts) {
	var translated = translate(opts);
	save({translated, ...opts});
	return translated;
}
async function getItems(cb) {
	var translations;
	try {
		translations = await storage.get('translations');
	} catch (e) {
		translations = {};
	};
	return Object.keys(translations).map(key => {
		return {original: key, ...translations[key]};
	});
}

module.exports = translateAndSave;
module.exports.getItems = getItems;

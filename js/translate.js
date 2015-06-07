var dictionary = require('./translate-en-ru-clean.json');
function translate({text}) {
	return dictionary[text.toLowerCase()];
}

module.exports = translate;

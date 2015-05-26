var YANDEX_API = 'https://translate.yandex.net/api/v1.5/tr.json/translate';
var API_KEY = 'trnsl.1.1.20150526T163258Z.e31edfbe7f6dbb02.3932f63682364dfb61c91fd82f3be71b1cf1453e';
// lang=en-ru&text=To+be,+or+not+to+be%3F&text=That+is+the+question.
function translate({from, to, text}) {
	var lang = [
		from || 'en',
		to || 'ru'
	].join('-');
	var url = `${YANDEX_API}?key=${API_KEY}&lang=${lang}&text=${text}`;

	return fetch(url).then(function (res) {
		return res.json()
	}).then(function (json) {
		return json.text;
	});
}

module.exports = translate;

var fontWidths = require('./font-widths');

function getNewOffset({height, width, text, offset, sign, lineHeight, fontSize}) {
	var lh = lineHeight;
	var lws = fontWidths[fontSize];
	var l = 0, w = 0, h = 0, i = offset;
	while (h < height - lh) {
		if (text[i] === '\n') {
			h += lh;
			w = 0;
			l = 0;
		} else if (text[i] === ' ') {
			if (l + w > width) {
				w = l;
				h += lh;
				l = 0;
			} else {
				l += lws[' '];
				w += l;
				l = 0;
			}
		} else {
			l += lws[text[i]] || 6;
		}
		i += sign;
	}
	return i + (sign < 0 ? 2 : 0);
}

function getWordByOffset({width, text, offset, lineHeight, fontSize, x, y}) {
	var lh = lineHeight;
	var lws = fontWidths[fontSize];
	var l = 0, w = 0, h = lh, i = offset;
	while (h < y || w < x) {
		if (text[i] === '\n') {
			h += lh;
			w = 0;
			l = 0;
		} else if (text[i] === ' ') {
			if (l + w > width) {
				w = l;
				h += lh;
				l = 0;
			} else {
				l += lws[' '];
				w += l;
				l = 0;
			}
		} else {
			l += lws[text[i]] || 6;
		}
		i ++;
	}
	console.log(h, w);
	console.log(text.slice(offset, i));
	return '';
}

module.exports = {getNewOffset, getWordByOffset};

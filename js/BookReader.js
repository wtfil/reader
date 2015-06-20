var React = require('react-native');
var {FileUtil, ScreenUtil} = require('NativeModules');
var {LayoutAnimation, StyleSheet, Text, View, TouchableOpacity, AlertIOS} = React;
var storage = require('./storage');
var translate = require('./translate');
var Settings = require('./Settings');
var Menu = require('./Menu');
var fontWidths = require('./font-widths');

function getNewOffset({height, width, text, offset, sign, lineHeight, fontSize}) {
	var lh = lineHeight;
	var lws = fontWidths[fontSize];
	var l = 0, tw = 0, w = 0, h = 0, i = offset;
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

function getWords(text) {
	return text.split(/([^\w])/);
}

class BookReader extends React.Component {

	static async routerWillRun(props) {
		return {
			book: await FileUtil.readFile('books/' + props.bookName),
			offset: await storage.get(`progress..books..${props.bookName}..offset`),
			settings: await storage.get('settings')
		};
	}

	constructor(props) {
		storage.set('progress..currentBook', props.bookName);
		super();
		this.state = {
			book: props.book,
			quick: true,
			timer: null,
			offset: props.offset || 0,
			showMenu: false
		};
	}

	componentDidMount() {
		this.getSlowUpdateTimer();
	}

	getSlowUpdateTimer() {
		return setTimeout(() => {
			this.setState({quick: false, timer: null})
		}, 0);
	}

	updateOffset(sign) {
		var offset = getNewOffset({
			text: this.state.book,
			sign: sign,
			offset: this.state.offset,
			width: ScreenUtil.width - 30, //TODO 2*padding
			height: ScreenUtil.height - 30,

			...Settings.fontSizes[this.props.settings.fontSize]
		});
		if (this.state.timer) {
			clearTimeout(this.state.timer);
		}
		this.setState({
			timer: this.getSlowUpdateTimer(),
			offset: offset,
			translated: null,
			quick: true
		});
		this.saveProgress(offset);
	}
	async saveProgress(offset) {
		storage.set(`progress..books..${this.props.bookName}..offset`, offset);
	}
	nextPage() {
		this.updateOffset(+1);
	}
	prevPage() {
		this.updateOffset(-1);
	}
	onWordPress(word) {
		var isWord = null;
		var translated;
		if (/^\w+$/.test(word)) {
			isWord = true;
			translated = translate({text: word});
			LayoutAnimation.configureNext(easeInEaseOut);
		}
		this.setState({
			showMenu: false,
			translated: isWord && {
				word: word,
				translated: translated || 'No translation'
			}
		});
	}
	closeTranslated() {
		this.setState({translated: null})
	}
	showMenu() {
		this.setState({showMenu: true});
	}
	onWordTouchUp(e, bookReader) {
		var touch = e.touchHistory.touchBank[1];
		var diff = touch.currentPageX - touch.startPageX;
		if (Math.abs(diff) < 30) {
			if (touch.currentTimeStamp - touch.startTimeStamp > 300) {
				bookReader.showMenu();
			} else {
				bookReader.onWordPress(this.props.children);
			}
		} else if (diff > 0) {
			bookReader.prevPage();
		} else if (diff < 0) {
			bookReader.nextPage();
		}
	}
	getTextStyles() {
		var config = this.props.settings
			&& Settings.fontSizes[this.props.settings.fontSize];

		return [styles.text, config];
	}
	goTo() {
		AlertIOS.prompt(
			'Enter position in %',
			(this.state.offset / this.state.book.length).toFixed(0),
			[
				{text: 'Go', onPress: val => {
					var offset = ~~(val / 100 * this.state.book.length);
					this.saveProgress(offset);
					this.setState({
						offset: offset,
						showMenu: false
					});
				}},
				{text: 'Cancel'}
			]
		)
	}
	render() {
		// TODO padding
		var progress = (this.state.offset / this.state.book.length) * (ScreenUtil.width - 14)
		var text = this.state.book.slice(this.state.offset, this.state.offset + 1000);
	   	var _this = this;

		function onWordTouchUp(e) {
			_this.onWordTouchUp.call(this, e, _this);
		}

		return <View ref="view" style={styles.main}>
			{this.state.quick ?
				<Text
					style={this.getTextStyles()}
					onResponderRelease={onWordTouchUp}
					onStartShouldSetResponder={() => true}
					children={text}
				/> :
				<Text style={this.getTextStyles()}>
					{getWords(text).map((word, index) =>
						<Text
							style={this.state.translated && this.state.translated.word === word && {backgroundColor: '#FAFAC3'}}
							key={index}
							onResponderRelease={onWordTouchUp}
							onStartShouldSetResponder={() => true}
							children={word}
						/>
					)}
				</Text>
			}
			<View style={styles.progress}>
				<View style={[styles.progressIndecator, {left: progress}]} />
				<Text style={styles.position}>{Math.round(this.state.offset / this.state.book.length * 100)}%</Text>
			</View>
			{this.state.translated &&
				<View
					style={styles.translated}
					onStartShouldSetResponder={() => true}
					onResponderRelease={this.closeTranslated.bind(this)}
					>
					<Text>
						{this.state.translated.word} - {this.state.translated.translated}
					</Text>
				</View>
			}
			{this.state.showMenu &&
				<View style={styles.menu}>
					<Menu {...this.props}/>
				</View>
			}
			{this.state.showMenu &&
				<View style={styles.bookMenu}>
					<TouchableOpacity onPress={this.goTo.bind(this)}>
						<Text>Go to</Text>
					</TouchableOpacity>
				</View>
			}
		</View>;
  	}
}

var styles = StyleSheet.create({
	main: {
		paddingHorizontal: 15,
		top: 0,
		bottom: 0,
		flex: 1,
	},
	bookMenu: {
		position: 'absolute',
		left: 0,
		backgroundColor: '#6CE8F8',
		padding: 10,
		right: -14,
		bottom: 0
	},
	menu: {
		position: 'absolute',
		left: 0,
		right: -14,
		top: 0
	},
	position: {
		fontSize: 6,
		textAlign: 'center'
	},
	translated: {
		flex: 1,
		position: 'absolute',
		bottom: 0,
		padding: 10,
		left: 0,
		right: -14,
		backgroundColor: '#FAFAC3'
	},
	text: {
		fontFamily: 'Helvetica Neue',
		bottom: 6,
		top: 0,
		position: 'absolute'
	},
	progress: {
		height: 3,
		position: 'absolute',
		left: 7,
		right: 0,
		bottom: 7,
		borderWidth: 1
	},
	progressIndecator: {
		borderWidth: 1,
		width: 3
	}
});

var easeInEaseOut = {
	duration: 100,
	create: {
	    type: LayoutAnimation.Types.easeInEaseOut,
	    property: LayoutAnimation.Properties.scaleXY,
	},
	update: {
	    delay: 0,
	    type: LayoutAnimation.Types.easeInEaseOut,
	}
};

module.exports = BookReader;

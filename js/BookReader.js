var React = require('react-native');
var {FileUtil, ScreenUtil} = require('NativeModules');
var {LayoutAnimation, StyleSheet, Text, View} = React;
var storage = require('./storage');
var translate = require('./translate');
var Menu = require('./Menu');

function onError(err) {
	console.error(err);
}

function getNewOffset({height, width, text, offset, sign}) {
	var lh = 17, lw = 7;
	var l = 0, tw = 0, w = 0, h = 0, i = offset;
	while (h < height) {
		if (text[i] === '\n') {
			h += lh;
			w = 0;
			l = 0;
		} else if (text[i] === ' ') {
			tw = (l + 1) * lw;
			if (tw + w > width) {
				l = 0;
				w = tw;
				h += lh;
			} else {
				l = 0;
				w += tw;
			}
		} else {
			l ++;
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
		var book = await FileUtil.readFile('books/' + props.bookName);
		var offset = await storage.get(`progress..books..${props.bookName}..offset`);
		return {book, offset};
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
			width: ScreenUtil.width - 10, //TODO 2*padding
			height: ScreenUtil.height - 30
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
		storage.set(`progress..books..${this.props.bookName}..offset`, offset)
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
		console.log(word);
		if (/^\w+$/.test(word)) {
			isWord = true;
			translated = translate({text: word});
			LayoutAnimation.configureNext(easeInEaseOut);
		}
		console.log(translated);
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
					style={styles.text}
					onResponderRelease={onWordTouchUp}
					onStartShouldSetResponder={() => true}
					children={text}
				/> :
				<Text style={styles.text}>
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
		</View>;
  	}
}

var styles = StyleSheet.create({
	main: {
		paddingHorizontal: 7,
		top: 0,
		bottom: 0,
		flex: 1,
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
		position: 'absolute',
		lineHeight: 15,
		fontSize: 15
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

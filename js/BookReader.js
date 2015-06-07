var React = require('react-native');
var {ScreenUtil, FileUtil} = require('NativeModules');
var {LayoutAnimation, TouchableOpacity, StyleSheet, Text, View} = React;
var progress = require('./progress');
var translate = require('./translate');

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
	constructor() {
		this.state = {
			book: null,
			quick: true,
			offset: 0
		};
	}
	componentWillMount() {
		FileUtil.readFile('books/' + this.props.bookName, onError, data => {
			this.setState({
				book: data,
				timer: this.getSlowUpdateTimer(),
				offset: this.props.offset || 0
			});
		});
	}
	getSlowUpdateTimer() {
		return setTimeout(this.setState.bind(this, {quick: false, timer: null}), 0);
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
		progress.setForCurrent('offset', offset);
	}
	nextPage() {
		this.updateOffset(+1);
	}
	prevPage() {
		this.updateOffset(-1);
	}
	onWordPress(word) {
		if (!/^\w+$/.test(word)) {
			return;
		}
		LayoutAnimation.configureNext(easeInEaseOut);
		this.setState({
			translated: translate({text: word})
		});
	}
	closeTranslated() {
		this.setState({translated: null})
	}
	onWordTouchUp(e, bookReader) {
		var touch = e.touchHistory.touchBank[1];
		var diff = touch.currentPageX - touch.startPageX;
		if (Math.abs(diff) < 5) {
			bookReader.onWordPress(this.props.children);
		} else if (diff > 0) {
			bookReader.prevPage();
		} else if (diff < 0) {
			bookReader.nextPage();
		}
	}
	render() {
		if (!this.state.book) {
			return <View>
				<Text>Loading...</Text>
			</View>;
		}

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
					onResponderRelease={onWordTouchUp}
					onStartShouldSetResponder={() => true}
					children={text}
				/> :
				<Text>
					{getWords(text).map((word, index) =>
						<Text
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
					<Text>{this.state.translated}</Text>
				</View>
			}
		</View>;
  	}
}

var styles = StyleSheet.create({
	main: {
		top: 0,
		bottom: 0,
		flex: 1,
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
		width: 1000,
		left: -10,
		backgroundColor: '#98A187'
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
		left: 0,
		right: 0,
		bottom: 0,
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

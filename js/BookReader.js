var React = require('react-native');
var {ScreenUtil, FileUtil} = require('NativeModules');
var {TouchableOpacity, StyleSheet, Text, View} = React;
var progress = require('./progress');

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

class BookReader extends React.Component {
	constructor() {
		this.state = {
			book: null,
			offset: 0
		};
	}
	componentWillMount() {
		FileUtil.readFile('books/' + this.props.bookName, onError, data => {
			this.setState({
				book: data,
				offset: this.props.offset || 0
			});
		});
	}
	updateOffset(sign) {
		var offset = getNewOffset({
			text: this.state.book,
			sign: sign,
			offset: this.state.offset,
			width: ScreenUtil.width - 10, //TODO 2*padding
			height: ScreenUtil.height - 30
		});
		console.log(offset - this.state.offset);
		this.setState({
			offset: offset
		});
		progress.setForCurrent('offset', offset);
	}
	nextPage() {
		this.updateOffset(+1);
	}
	prevPage() {
		this.updateOffset(-1);
	}
	onWordPress({x, y}) {
		console.log(x, y);
		return;
		var word = this.children;
		if (!/\w+/.test(word)) {
			return;
		}
	}
	onWordTouchUp(e) {
		var touch = e.touchHistory.touchBank[1];
		var diff = touch.currentPageX - touch.startPageX;
		if (Math.abs(diff) < 5) {
			this.onWordPress({
				x: e.nativeEvent.locationX,
				y: e.nativeEvent.locationY
			});
		} else if (diff > 0) {
			this.prevPage();
		} else if (diff < 0) {
			this.nextPage();
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

		/*
		var words = this.state.book
			.slice(this.state.offset, this.state.offset + 1000)
			.split(/([^\w])/);

		{words.map(word =>
		   <Text onResponderRelease={this.onWordTouchUp.bind(this)} onPress={this.onWordPress}>{word}</Text>
		)}
		*/
		return <View ref="view" style={styles.main}>
			<Text style={styles.text} onStartShouldSetResponder={() => true} onResponderRelease={this.onWordTouchUp.bind(this)}>
				{this.state.book.slice(this.state.offset, this.state.offset + 1000)}
			</Text>
			<View style={styles.progress}>
				<View style={[styles.progressIndecator, {left: progress}]} />
				<Text style={styles.position}>{Math.round(this.state.offset / this.state.book.length * 100)}%</Text>
			</View>
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

module.exports = BookReader;

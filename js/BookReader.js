var React = require('react-native');
var {ScreenUtil, FileUtil} = require('NativeModules');
var {TouchableOpacity, StyleSheet, Text, View} = React;
var progress = require('./progress');

function onError(err) {
	console.error(err);
}

function getPageSize({height, width, text, offset}) {
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
		i ++;
	}
	return i - offset;
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
	nextPage() {
		var pageSize = getPageSize({
			text: this.state.book,
			offset: this.state.offset,
			width: ScreenUtil.width - 10, //TODO 2*padding
			height: ScreenUtil.height - 30
		});
		var offset = this.state.offset + pageSize;
		this.setState({
			offset: offset
		});
		progress.setForCurrent('offset', offset);
	}
	prevPage() {
	}
	onWordPress() {
		var word = this.children;
		if (!/\w+/.test(word)) {
			return;
		}
		console.log(this.children);
	}
	onWordTouchUp(e) {
		var touch = e.touchHistory.touchBank[1];
		var diff = touch.currentPageX - touch.startPageX;
		if (Math.abs(diff) < 5) {
			return;
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

		var words = this.state.book
			.slice(this.state.offset, this.state.offset + 1000)
			.split(/([^\w])/);

		return <View ref="view" style={styles.main}>
			<Text style={styles.text}>
				{words.map(word =>
					<Text onResponderRelease={this.onWordTouchUp.bind(this)} onPress={this.onWordPress}>{word}</Text>
				)}
			</Text>
			<View style={styles.progress}>
				<View style={[styles.progressIndecator, {left: progress}]} />
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
	text: {
		fontFamily: 'Helvetica Neue',
		bottom: 9,
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

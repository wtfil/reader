var React = require('react-native');
var {ScreenUtil, FileUtil} = require('NativeModules');
var {TouchableOpacity, StyleSheet, Text, View} = React;

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
			this.setState({book: data});
		});
	}
	onPress() {
		var pageSize = getPageSize({
			text: this.state.book,
			offset: this.state.offset,
			width: ScreenUtil.width - 10, //TODO 2*padding
			height: ScreenUtil.height - 30
		});
		this.setState({
			offset: this.state.offset + pageSize
		});
	}
	render() {
		if (!this.state.book) {
			return <View>
				<Text>Loading...</Text>
			</View>;
		}

		// TODO padding
		var progress = (this.state.offset / this.state.book.length) * (ScreenUtil.width - 14)

		return <View ref="view" style={styles.main}>
			<TouchableOpacity onPress={this.onPress.bind(this)}>
				<Text style={styles.text}>
					{this.state.book.slice(this.state.offset, this.state.offset + 1000)}
				</Text>
			</TouchableOpacity>
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
		bottom: 10,
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

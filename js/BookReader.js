var React = require('react-native');
var {ScreenUtil, FileUtil} = require('NativeModules');
var {TouchableOpacity, StyleSheet, Text, View} = React;

function onError(err) {
	console.error(err);
}
console.log(ScreenUtil);

class BookReader extends React.Component {
	constructor() {
		this.state = {
			book: null,
			needMeasure: false,
			nextPageSize: 1500,
			nextPageSizeStep: 500,
			prevTextHeight: 0,
			offset: 0
		};
	}
	componentWillMount() {
		FileUtil.readFile('books/' + this.props.bookName, onError, data => {
			this.setState({book: data});
		});
	}
	componentDidUpdate() {
		if (this.state.needMeasure) {
			this.measureView();
		}
	}
	measureView() {
		console.time('measure');
		var {state} = this;
		this.refs.nextView.measure((px, py, width, height) => {
			console.log(height, state.prevTextHeight);
			if (height < ScreenUtil.height) {
				console.log('ls', height);
				this.setState({
					prevTextHeight: height,
					prev2TextHeight: state.prevTextHeight,
					nextPageSizeStep: Math.max(10, ~~(state.nextPageSizeStep / 2)),
					nextPageSize: state.nextPageSize + state.nextPageSizeStep
				});
			} else if (height === state.prev2TextHeight) {
				console.timeEnd('measure');
				console.log(height, state.prevTextHeight, state.nextPageSize);
				console.log(state.nextPageSize);
				this.setState({
					needMeasure: false,
					offset: state.offset + state.nextPageSize,
					nextPageSize: 1500,
					nextPageSizeStep: 500
				});
			} else {
				console.log('gt', height);
				this.setState({
					prev2TextHeight: state.prevTextHeight,
					prevTextHeight: height,
					nextPageSize: state.nextPageSize - state.nextPageSizeStep
				});
			}
		});
	}
	onPress() {
		this.setState({needMeasure: true});
	}
	render() {
		return <View ref="view" style={styles.main}>
			{this.state.book ?
				<View>
					<View ref="nextView" style={styles.hiddenText}>
						<Text>
							{this.state.book.slice(this.state.offset, this.state.offset + this.state.nextPageSize)}
						</Text>
					</View>
					<TouchableOpacity onPress={this.onPress.bind(this)}>
						<Text style={styles.text}>
							{this.state.book.slice(this.state.offset, this.state.offset + 1000)}
						</Text>
					</TouchableOpacity>
				</View> :
				<Text>Loading...</Text>
			}
		</View>;
  	}
}

var styles = StyleSheet.create({
	main: {
		padding: 30
	},
	text: {
		lineHeight: 15,
		fontSize: 15
	},
	hiddenText: {
		position: 'absolute'
	}
});

module.exports = BookReader;

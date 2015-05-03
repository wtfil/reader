var React = require('react-native');
var {ScreenUtil, FileUtil} = require('NativeModules');
var {TouchableOpacity, StyleSheet, Text, View} = React;

function onError(err) {
	console.error(err);
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
		this.setState({
			offset: this.state.offset + 100
		});
	}
	render() {
		return <View style={styles.main}>
			{this.state.book ?
				<TouchableOpacity onPress={this.onPress.bind(this)}>
					<Text style={styles.text}>
						{this.state.book.slice(this.state.offset, this.state.offset + 1000)}
					</Text>
				</TouchableOpacity> :
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
	}
})

module.exports = BookReader;

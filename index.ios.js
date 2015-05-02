'use strict';

var React = require('react-native');
var {AppRegistry, StyleSheet, Text, View} = React;
var {FileUtil} = require('NativeModules');

function onError(err) {
	console.error(err);
}

var Library = React.createClass({
	getInitialState() {
		return {books: []};
	},
	componentWillMount() {
		FileUtil.readDir('books', onError, data => {
			this.setState({books: data});
		});
	},
	render() {
		return <View style={styles.container}>
			{this.state.books.map(book => <Text>{book}</Text>)}
		</View>;
	}
});
var BookReader = React.createClass({
	getInitialState() {
		return {book: ''};
	},
	componentWillMount() {
		FileUtil.readFile('books/book-1.txt', onError, data => {
			this.setState({book: data});
		});
	},
	render() {
		return <View style={styles.container}>
			<Text>{this.state.book.slice(0, 10000)}</Text>
		</View>;
  	}
});

var styles = StyleSheet.create({
  	container: {
    	flex: 1,
    	justifyContent: 'center',
    	alignItems: 'center',
    	backgroundColor: '#F5FCFF',
  	},
  	welcome: {
    	fontSize: 20,
    	textAlign: 'center',
    	margin: 10,
  	},
  	instructions: {
    	textAlign: 'center',
    	color: '#333333',
  	}
});

AppRegistry.registerComponent('AwesomeProject', () => Library);

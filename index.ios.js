'use strict';

var React = require('react-native');
var {TouchableHighlight, Navigator, AppRegistry, StyleSheet, Text, View} = React;
var {FileUtil} = require('NativeModules');

function onError(err) {
	console.error(err);
}

function setResponder() {
	return true;
}

class Library extends React.Component {
	constructor() {
		this.state = {books: []};
	}
	componentWillMount() {
		FileUtil.readDir('books', onError, data => {
			this.setState({books: data});
		});
	}
	onBookTouch(bookName) {
		this.props.navigation.replace({
			component: BookReader,
			props: {bookName: bookName}
		});
	}
	render() {
		return <View style={styles.container}>
			{this.state.books.map((bookName, index) =>
				<TouchableHighlight onPress={this.onBookTouch.bind(this, bookName)}>
					<Text>{bookName}</Text>
				</TouchableHighlight>
			)}
		</View>;
	}
}

class BookReader extends React.Component {
	constructor() {
		this.state = {book: null};
	}
	componentWillMount() {
		FileUtil.readFile('books/' + this.props.bookName, onError, data => {
			this.setState({book: data});
		});
	}
	render() {
		return <View style={styles.container}>
			<Text>{this.state.book ?
				this.state.book.slice(0, 10000) :
				'Loading...'
			}</Text>
		</View>;
  	}
}

class App extends React.Component {
	renderScene(route, navigation) {
		var Component = route.component;
		return <View style={styles.container}>
			<Component {...route.props} navigation={navigation}/>
		</View>;
	}
	render() {
		return <Navigator
			renderScene={this.renderScene}
			initialRoute={{
				component: Library
			}}
		/>;
	}
}

var styles = StyleSheet.create({
  	container: {
    	flex: 1,
    	justifyContent: 'center',
    	alignItems: 'center',
    	backgroundColor: '#F5FCFF',
  	},
});

AppRegistry.registerComponent('AwesomeProject', () => App);

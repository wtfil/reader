require('regenerator/runtime');
var React = require('react-native');
var {AppRegistry, StyleSheet, View} = React;
var BookReader = require('./js/BookReader');
var Library = require('./js/Library');
var Settings = require('./js/Settings');
var Dropbox = require('./js/Dropbox');
var Dictionary = require('./js/Dictionary');
var storage = require('./js/storage');
var {Route, Router, navigate} = require('./js/Router');

class App extends React.Component {
	async componentDidMount() {
		var currentBook = await storage.get('progress..currentBook');
		return navigate('library')
		if (currentBook) {
			navigate('reader', {bookName: currentBook});
		} else {
			navigate('library');
		}
	}
	render() {
		return <View style={styles.container}>
			<Router handleUncaught >
				<Route name="library" handler={Library} />
				<Route name="reader" handler={BookReader} />
				<Route name="settings" handler={Settings} />
				<Route name="dropbox" handler={Dropbox} />
				<Route name="dictionary" handler={Dictionary} />
			</Router>
		</View>;
	}
}

var styles = StyleSheet.create({
	container: {
		paddingTop: 30,
		flex: 1,
		backgroundColor: '#F5FCFF'
	}
});

AppRegistry.registerComponent('Reader', () => App);

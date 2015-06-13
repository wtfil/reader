var React = require('react-native');
var {AppRegistry, StyleSheet, View} = React;
var BookReader = require('./js/BookReader');
var Library = require('./js/Library');
var Settings = require('./js/Settings');
var Dropbox = require('./js/Dropbox');
var Dictionary = require('./js/Dictionary');
var progress = require('./js/progress');
var {Route, Router, navigate} = require('./js/Router');

class App extends React.Component {
	componentDidMount() {
		progress.get((err, progress) => {
			if (progress && progress.currentBook) {
				navigate('reader', {bookName: progress.currentBook});
			} else {
				navigate('library');
			}
		});
	}
	render() {
		return <View style={styles.container}>
			<Router>
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

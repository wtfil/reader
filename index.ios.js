'use strict';

var React = require('react-native');
var {TouchableOpacity, ListView, Navigator, AppRegistry, StyleSheet, Text, View} = React;
var {FileUtil} = require('NativeModules');
var BookReader = require('./js/BookReader');

function arrToDS(arr) {
	var ds = new ListView.DataSource({
		rowHasChanged: (r1, r2) => r1 !== r2
	});
	return ds.cloneWithRows(arr);
}

function readBooksDir(cb) {
	FileUtil.readDir(
		'books',
		err => {
			FileUtil.createDir('books', err => {
				cb(err, []);
			});
		},
		data => { cb(null, data); }
	);
}

class Library extends React.Component {
	constructor() {
		this.state = {
			books: arrToDS([])
		};
	}
	componentWillMount() {
		readBooksDir((err, books) => {
			if (err) {
				return console.error(err);
			}
			this.setState({books: arrToDS(books)});
		});
	}
	onBookTouch(bookName) {
		this.props.navigation.replace({
			component: BookReader,
			props: {bookName: bookName}
		});
	}
	render() {
		return <ListView style={styles.library}
			dataSource={this.state.books}
			renderSectionHeader={() => {
				return <Text style={styles.libraryHeader}>Your library</Text>
			}}
			renderRow={bookName =>
				<TouchableOpacity onPress={this.onBookTouch.bind(this, bookName)}>
					<View style={styles.libraryRow}>
						<Text>{bookName}</Text>
					</View>
				</TouchableOpacity>
			}
		/>;
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
	libraryHeader: {
		fontSize: 18,
		marginBottom: 10
	},
	libraryRow: {
	},
	library: {
	},
	container: {
		paddingTop: 30,
		paddingLeft: 7,
		paddingRight: 7,
		paddingBottom: 7,
		flex: 1,
		backgroundColor: '#F5FCFF'
	},
});

AppRegistry.registerComponent('AwesomeProject', () => App);

'use strict';

var React = require('react-native');
var {TouchableOpacity, ListView, Navigator, AppRegistry, StyleSheet, Text, View} = React;
var {FileUtil} = require('NativeModules');
var BookReader = require('./js/BookReader');
var progress = require('./js/progress');

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
				return cb(err);
			});
		},
		data => {
			if (data.length) {
				return cb(null, data);
			}
			fetch('https://downloader.disk.yandex.ru/disk/89ce42eef11d349b64ce2ce10bb76ced2886f8b486098e4ac11b133d8975fd0a/5558dfa2/3PUrd4R4KxAFOPNm6iQvaoJD0Mh9I7zjMUtu1Bb5Lzq5IZa2T-RFV-3ZHhSI2Xe6BSim3CHJoyRaG6sgkH3qyQ%3D%3D?uid=0&filename=foundation.txt&disposition=attachment&hash=0CPiM4wwBp//hLi/tYHLlE%2BZaOh9UZQyXo3cU%2BC0T7g%3D&limit=0&content_type=text%2Fplain&fsize=398623&hid=3dd09a80b9f6d668ba5c2f93c2817468&media_type=document&tknv=v2')
				.then(function (data) {
					return data.text();
				})
				.then(function (text) {
					FileUtil.writeFile('books/text.txt', text, function (err) {
						if (err) {
							return cb(err);
						}
						return cb(null, ['text.txt']);
					});
				});
		}
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
	onBookSelect(bookName) {
		progress.set('currentBook', bookName);
		this.props.navigation.replace({
			component: BookReader,
			props: {bookName: bookName}
		});
	}
	onNavigationStateChange(e) {
		console.log(e);
	}
	render() {
		return <View>
			<ListView style={styles.library}
				dataSource={this.state.books}
				renderSectionHeader={() => {
					return <Text style={styles.libraryHeader}>Your library</Text>
				}}
				renderRow={bookName =>
					<TouchableOpacity onPress={this.onBookSelect.bind(this, bookName)}>
						<View style={styles.libraryRow}>
							<Text>{bookName}</Text>
						</View>
					</TouchableOpacity>
				}
			/>
		</View>;
	}
}

class App extends React.Component {
	constructor() {
		this.state = {};
		progress.get((err, progress) => {
			this.setState({
				progress: progress,
				loaded: true
			});
		});
	}
	renderScene(route, navigation) {
		var Component = route.component;
		return <View style={styles.container}>
			<Component {...route.props} navigation={navigation}/>
		</View>;
	}
	render() {
		if (!this.state.loaded) {
			return <View></View>;
		}
		var progress = this.state.progress;
		var initialRoute = progress && progress.currentBook ?
			{
				component: BookReader,
				props: {
					bookName: progress.currentBook,
					offset: progress.books &&
						progress.books[progress.currentBook] &&
						progress.books[progress.currentBook].offset || 0
				}
			} : {
				component: Library
			};
		return <Navigator
			renderScene={this.renderScene}
			initialRoute={initialRoute}
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

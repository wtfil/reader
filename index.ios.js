'use strict';

var React = require('react-native');
var {TouchableOpacity, ListView, Navigator, AppRegistry, StyleSheet, Text, View} = React;
var {FileUtil} = require('NativeModules');

function onError(err) {
	console.error(err);
}

function setResponder() {
	return true;
}

function arrToDS(arr) {
	var ds = new ListView.DataSource({
		rowHasChanged: (r1, r2) => r1 !== r2
	});
	return ds.cloneWithRows(arr);
}

class Library extends React.Component {
	constructor() {
		this.state = {
			books: arrToDS([])
		};
	}
	componentWillMount() {
		FileUtil.readDir('books', onError, data => {
			this.setState({
				books: arrToDS(data)
			});
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
		return <View style={styles.bookReader}>
			{this.state.book ?
				<TouchableOpacity onPress={this.onPress.bind(this)}>
					<Text>
						{this.state.book.slice(this.state.offset, this.state.offset + 1000)}
					</Text>
				</TouchableOpacity> :
				<Text>Loading...</Text>
			}
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
	bookReader: {
		padding: 30
	},
	libraryHeader: {
		fontSize: 18,
		marginBottom: 10
	},
	libraryRow: {
		paddingLeft: 20
	},
	library: {
		paddingTop: 50,
	},
	container: {
		flex: 1,
		backgroundColor: '#F5FCFF'
	},
});

AppRegistry.registerComponent('AwesomeProject', () => App);

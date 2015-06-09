var React = require('react-native');
var {FileUtil} = require('NativeModules');
var {TouchableOpacity, ListView, StyleSheet, Text, View} = React;
var progress = require('./progress');
var {navigate} = require('./Router');

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
			fetch('https://downloader.disk.yandex.ru/disk/7c078d4793daa1ac3b888947a385c6aaedd737951009eb229d8c2ef2976afa36/5574633b/3PUrd4R4KxAFOPNm6iQvaoJD0Mh9I7zjMUtu1Bb5Lzq5IZa2T-RFV-3ZHhSI2Xe6BSim3CHJoyRaG6sgkH3qyQ%3D%3D?uid=0&filename=foundation.txt&disposition=attachment&hash=0CPiM4wwBp//hLi/tYHLlE%2BZaOh9UZQyXo3cU%2BC0T7g%3D&limit=0&content_type=text%2Fplain&fsize=398623&hid=3dd09a80b9f6d668ba5c2f93c2817468&media_type=document&tknv=v2')
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
		navigate('reader', {
			bookName: bookName
		});
	}
	onNavigationStateChange(e) {
		console.log(e);
	}
	render() {
		return <View>
			<ListView
				dataSource={this.state.books}
				renderSectionHeader={() => {
					return <Text style={styles.header}>Your library</Text>
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

var styles = StyleSheet.create({
	header: {
		fontSize: 18,
		marginBottom: 10
	}
});

module.exports = Library;

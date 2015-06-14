var React = require('react-native');
var {FileUtil} = require('NativeModules');
var {ListView, StyleSheet, Text, View} = React;
var progress = require('./progress');
var {Link} = require('./Router');

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
			cb(null, data);
		}
	);
}

class Library extends React.Component {
	constructor() {
		super();
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
	render() {
		return <View style={styles.main}>
			<ListView
				dataSource={this.state.books}
				renderSectionHeader={() => {
					return <View style={styles.header}>
					 	 <Text style={styles.headerText}>Your library</Text>
						 <Link name="dropbox">
						 	<Text style={styles.upload}>Dropbox</Text>
						 </Link>
					</View>
				}}
				renderRow={bookName =>
					<Link name="reader" query={{bookName: bookName}}>
						<View style={styles.libraryRow}>
							<Text>{bookName}</Text>
						</View>
					</Link>
				}
			/>
		</View>;
	}
}

var styles = StyleSheet.create({
	main: {
		paddingHorizontal: 7
	},
	header: {
		flexDirection: 'row',
		fontSize: 18,
		marginBottom: 10
	},
	headerText: {
		marginRight: 10
	},
	upload: {
		color: 'green'
	}
});

module.exports = Library;

var React = require('react-native');
var {FileUtil} = require('NativeModules');
var {ListView, StyleSheet, Text, View} = React;
var storage = require('./storage');
var {Link} = require('./Router');

function arrToDS(arr) {
	var ds = new ListView.DataSource({
		rowHasChanged: (r1, r2) => r1 !== r2
	});
	return ds.cloneWithRows(arr);
}

class Library extends React.Component {

	static async routerWillRun(props) {
		var library;
		try {
			library = await FileUtil.readDir('books');
		} catch (e) {
			library = [];
		};
		return {library};
	}

	constructor(props) {
		super();
		storage.set('progress..currentBook', null);
		this.state = {
			books: arrToDS(props.library)
		};
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

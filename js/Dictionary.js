var React = require('react-native');
var {Link} = require('./Router');
var {TouchableOpacity, StyleSheet, Text, View, ListView} = React;
var translate = require('./translate');

function parseTime(timestamp) {
	var minutes = (Date.now() - timestamp) / 1000 / 60;
	if (minutes < 60) {
		return `${~~minutes}m`
	} else if (minutes < 60 * 24) {
		return `${~~(minutes / 60)}h`
	} else {
		return `${~~(minutes / 60 / 24)}d`
	}
}

class Word extends React.Component {
	render() {
		return <View style={styles.word}>
			<Text style={styles.original}>{this.props.original}</Text>
			<Text style={styles.translated}>{this.props.translated}</Text>
			<Text style={styles.counter}>{this.props.counter}</Text>
			<Text style={styles.time}>{parseTime(this.props.lastTime)}</Text>
		</View>;
	}
}

class Dictionary extends React.Component {
	static async routerWillRun() {
		return {
			words: await translate.getItems()
		};
	}
	constructor() {
		super();
		this.state = {
			sortKey: 'counter',
			order: 1
		};
	}
	getDS() {
		var key = this.state.sortKey;
		var order = this.state.order;
		var ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => true
		});
		var arr = this.props.words
			.slice()
			.sort((a, b) => {
				if (typeof a[key] === 'string') {
					return order * a[key].localeCompare(b[key]);
				}
				return order * (a[key] - b[key]);
			});
		return ds.cloneWithRows(arr);
	}
	sortBy(field) {
		this.setState({
			sortKey: field,
			order: field === this.state.sortKey ?
				-this.state.order :
				this.state.order
		});
	}
	render() {
		return <ListView
			dataSource={this.getDS()}
			renderSectionHeader={() => {
				return <View style={styles.header}>
					<Link name="library">
						<Text>B</Text>
					</Link>
					<TouchableOpacity onPress={this.sortBy.bind(this, 'original')}>
						<Text style={styles.original}>Original</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={this.sortBy.bind(this, 'translated')}>
						<Text style={styles.translated}>Translate</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={this.sortBy.bind(this, 'counter')}>
						<Text style={styles.counter}>Count</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={this.sortBy.bind(this, 'lastTime')}>
						<Text style={styles.counter}>Time</Text>
					</TouchableOpacity>
				</View>
			}}
			renderRow={item =>
				<Word {...item} />
			}
		/>;
	}
}

var styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		paddingVertical: 7,
		paddingHorizontal: 5,
		backgroundColor: '#eee',
	},
	word: {
		flexDirection: 'row',
		borderTopWidth: 1,
		borderTopColor: '#eee',
		padding: 5
	},
	original: {
		flex: 0.4
	},
	translated: {
		flex: 0.3
	},
	counter: {
		flex: 0.15
	},
	time: {
		flex: 0.15
	}
});

module.exports = Dictionary;

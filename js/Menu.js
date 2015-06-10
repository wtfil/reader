var React = require('react-native');
var {Link} = require('./Router');
var {StyleSheet, Text, View} = React;

class Menu extends React.Component {
	constructor() {
		super();
	}
	render() {
		return <View style={styles.main}>
			<Link name="library">
				<Text>Home</Text>
			</Link>
		</View>;
	}
}

var styles = StyleSheet.create({
	main: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		padding: 10,
		backgroundColor: '#6CE8F8',
	}
});

module.exports = Menu;

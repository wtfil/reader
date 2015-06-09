var React = require('react-native');
var {navigate} = require('./Router');
var {TouchableOpacity, StyleSheet, Text, View} = React;

class Menu extends React.Component {
	constructor() {
		super();
	}
	home() {
		navigate('library');
	}
	render() {
		return <View style={styles.main}>
			<TouchableOpacity onPress={this.home.bind(this)}>
				<Text>Home</Text>
			</TouchableOpacity>
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

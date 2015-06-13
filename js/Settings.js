var React = require('react-native');
var {StyleSheet, Text, View} = React;
var {Link} = require('./Router');

class Settings extends React.Component {
	render() {
		return <View>
			<Link name="library">
				<Text>Back</Text>
			</Link>
		</View>;
	}
}

var styles = StyleSheet.create({
});

module.exports = Settings;

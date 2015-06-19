var React = require('react-native');
var {StyleSheet, Text, View, SegmentedControlIOS} = React;
var storage = require('./storage');
var Menu = require('./Menu');

var fontSizes = {
	small: 12,
	middle: 15,
	big: 18
};
var defaultSettings = {
	fontSize: 'middle'
};

class Settings extends React.Component {

	static async routerWillRun() {
		return {
			settings: await storage.get('settings')
		}
	}

	constructor(props) {
		super()
		this.state = props.settings || defaultSettings;
	}

	onFontChange(fontSize) {
		this.setState({
			fontSize: fontSize
		});
		storage.set('settings..fontSize', fontSize);
	}

	render() {
		var fontSizesValues = Object.keys(fontSizes);
		return <View>
			<Menu/>
			<View style={styles.options}>
				<Text style={styles.title}>Font size</Text>
				<SegmentedControlIOS
					onValueChange={this.onFontChange.bind(this)}
					style={styles.fontSizes}
					values={fontSizesValues}
					selectedIndex={fontSizesValues.indexOf(this.state.fontSize)}
				/>
			</View>
		</View>;
	}
}

var styles = StyleSheet.create({
	options: {
		padding: 7,
		flexDirection: 'row'
	},
	title: {
		lineHeight: 22,
		marginRight: 10
	},
	fontSizes: {
		width: 200
	}
});

module.exports = Settings;

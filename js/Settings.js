var React = require('react-native');
var {StyleSheet, Text, View, SegmentedControlIOS, AsyncStorage} = React;
var Menu = require('./Menu');

var fontSizes = {
	small: 12,
	middle: 14,
	big: 16
};
var defaultSettings = {
	fontSize: 'middle'
};

class Settings extends React.Component {
	constructor() {
		super()
		this.state = {
			settings: null
		};
		AsyncStorage.getItem('settings', (err, settings) => {
			settings = settings ? JSON.parse(settings) : defaultSettings;
			this.setState({
				settings: settings
			});
		});
	}
	render() {
		var settings = this.state.settings;
		var fontSizesValues = Object.keys(fontSizes);
		return <View>
			<Menu/>
			{settings &&
				<View style={styles.options}>
					<Text style={styles.title}>Font size</Text>
					<SegmentedControlIOS
						style={styles.fontSizes}
						values={fontSizesValues}
						selectedIndex={fontSizesValues.indexOf(settings.fontSize)}
					/>
				</View>
			}
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

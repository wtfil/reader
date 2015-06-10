var React = require('react-native');
var {TextInput, StyleSheet, Text, View} = React;
var {FileUtil} = require('NativeModules');
var {Link} = require('./Router');

class Upload extends React.Component {
	constructor() {
		super();
		this.state = {
			url: 'https://google.com',
			error: null,
			donloaded: null
		};
	}
	onChange(e) {
		var url = e.nativeEvent.text;
		var name = url.split('/').pop();
		fetch(url)
			.then(data => data.text())
			.then(text => {
				FileUtil.writeFile(`books/${name}`, text, err => {
					this.setState({
						donloaded: !err && name,
						error: err
					});
				});
			})
			.catch(alert);
		this.setState({
			url: url
		});

	}
	render() {
		return <View>
			<TextInput
				style={styles.input}
				value={this.state.url}
				onSubmitEditing={this.onChange.bind(this)}
			/>
			<Link name="library">
				<Text>Back</Text>
			</Link>
			{this.state.donloaded &&
				<Text>Uploaded {this.state.donloaded}</Text>
			}
			{this.state.error &&
				<Text>{this.setState.error}</Text>
			}
		</View>;
	}
}

var styles = StyleSheet.create({
	webView: {
		flex: 1,
		height: 400
	},
	input: {
		height: 20
	}
});

module.exports = Upload;

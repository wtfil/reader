var React = require('react-native');
var qs = require('shitty-qs');
var {StyleSheet, Text, View, Component, LinkingIOS, AsyncStorage} = React;
var {Link} = require('./Router');
var DROPBOX = {
	appKey: 'o62umtq5zggnj9n',
	redirectUri: 'react-reader://dropbox'
};

function dropboxOauth(cb) {
	AsyncStorage.getItem('dropbox', (err, dropbox) => {
		if (dropbox) {
			return cb(null, JSON.parse(dropbox));
		}
		var url = `https://www.dropbox.com/1/oauth2/authorize?response_type=token&client_id=${DROPBOX.appKey}&redirect_uri=${DROPBOX.redirectUri}`
		LinkingIOS.addEventListener('url', e => {
			var query = qs(e.url.split('#')[1]);
			LinkingIOS.removeEventListener('url');
			AsyncStorage.setItem('dropbox', JSON.stringify(query));
			cb(null, query);
		});
		LinkingIOS.openURL(url);
	});
}

class Upload extends Component {
	constructor() {
		super();
		this.state = {query: null};
	}
	componentDidMount() {
		dropboxOauth((err, query) => {
			this.setState({
				query: query
			});
		});
	}
	render() {
		return <View>
			<Text>
				{JSON.stringify(this.state.query)}
			</Text>
		</View>;
	}
}

var styles = StyleSheet.create({});

module.exports = Upload;

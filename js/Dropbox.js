var React = require('react-native');
var qs = require('qs');
var {StyleSheet, Text, View, Component, LinkingIOS, AsyncStorage, TouchableOpacity} = React;
var {navigate, Link} = require('./Router');
var {FileUtil} = require('NativeModules');
var api = new DropboxApi();

class DropboxApi {
	constructor() {
		this.APP_KEY = 'o62umtq5zggnj9n';
		this.REDIRECT_URI = 'react-reader://dropbox';
	}
	getToken() {
		if (this.authPromise) {
			return this.authPromise;
		}
		this.authPromise = AsyncStorage.getItem('dropbox')
			.then(data => {
				return JSON.parse(data).access_token;
			})
			.catch(() => {
				var url = 'https://www.dropbox.com/1/oauth2/authorize?' + qs.stringify({
					response_type: 'token',
					client_id: this.APP_KEY,
					redirect_uri: this.REDIRECT_URI
				});
				return new Promise(resolve => {
					LinkingIOS.addEventListener('url', e => {
						var query = qs.parse(e.url.split('#')[1]);
						LinkingIOS.removeEventListener('url');
						AsyncStorage.setItem('dropbox', JSON.stringify(query));
						resolve(query.access_token);
					});
					LinkingIOS.openURL(url);
				});
			});
		return this.authPromise;
	}
	call({endpoint, method, origin}) {
		return this.getToken().then(token => {
			return fetch(
				`https://${origin}.dropbox.com/1/${endpoint}`,
				{
					method: method,
					headers: {
						'Authorization': `Bearer ${token}`
					}
				}
			);
		});
	}
	content(path) {
		return this.call({
			endpoint: 'metadata/auto' + path,
			method: 'get',
			origin: 'api'
		}).then(res => {
			return res.json();
		}).then(json => {
			return json.contents;
		});
	}
	download(path) {
		return this.call({
			endpoint: 'files/auto/' + path,
			method: 'get',
			origin: 'api-content'
		}).then(res => {
			return res.text();
		});
	}
}


function downloadFile(path) {
	var name = path.split('/').pop();
	api.download(path).then(text => {
		FileUtil.writeFile('books/' + name, text, err => {
			if (err) {
				console.log(err);
			}
			navigate('reader', {bookName: name});
		});
	});
}

class Dropbox extends Component {
	constructor() {
		super();
		this.state = {
			files: [],
			cursor: '/'
		};
	}
	updateFiles(cursor) {
		api.content(cursor).then(contents => {
			this.setState({
				files: contents,
				cursor: cursor
			});
		});
	}
	componentWillMount() {
		this.updateFiles('/');
	}
	back() {
		var cursor = this.state.cursor.split('/').slice(0, -1).join('/');
		this.updateFiles(cursor);
	}
	render() {
		return <View>
			<TouchableOpacity onPress={this.back.bind(this)}>
				<Text>Back</Text>
			</TouchableOpacity>
			<Link name="library">
				<Text>Library</Text>
			</Link>
			<View style={styles.list}>
				{this.state.files.map(file => {
					return <View>
						<TouchableOpacity onPress={() => {
							if (file.is_dir) {
								this.updateFiles(file.path);
							} else {
								downloadFile(file.path);
							}
						}}>
							<Text>
								{file.path.slice(1) + (file.is_dir ? '/' : '')}
							</Text>
						</TouchableOpacity>
					</View>
				})}
			</View>
		</View>;
	}
}

var styles = StyleSheet.create({
	list: {
		paddingTop: 10
	}
});

module.exports = Dropbox;

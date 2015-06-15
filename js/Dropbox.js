var React = require('react-native');
var qs = require('qs');
var {StyleSheet, Text, View, Component, LinkingIOS, AsyncStorage, TouchableOpacity} = React;
var {navigate, Link} = require('./Router');
var {FileUtil} = require('NativeModules');
var storage = require('./storage');

class DropboxApi {
	constructor() {
		this.APP_KEY = 'o62umtq5zggnj9n';
		this.REDIRECT_URI = 'react-reader://dropbox';
	}
	async getToken() {
		if (this.token) {
			return this.token;
		}
		var authData = await storage.get('dropbox');
		if (authData) {
			this.token = authData.access_token;
			return this.token;
		}

		var url = 'https://www.dropbox.com/1/oauth2/authorize?' + qs.stringify({
			response_type: 'token',
			client_id: this.APP_KEY,
			redirect_uri: this.REDIRECT_URI
		});
		authData = await new Promise(resolve => {
			LinkingIOS.addEventListener('url', e => {
				var query = qs.parse(e.url.split('#')[1]);
				LinkingIOS.removeEventListener('url');
				AsyncStorage.setItem('dropbox', JSON.stringify(query));
				resolve(query.access_token);
			});
			LinkingIOS.openURL(url);
		});
		await storage.set('dropbox', authData);
		this.token = authData.access_token;
		return this.token;
	}

	async call({endpoint, method, origin}) {
		var token = await this.getToken();
		return fetch(
			`https://${origin}.dropbox.com/1/${endpoint}`,
			{
				method: method,
				headers: {
					'Authorization': `Bearer ${token}`
				}
			}
		);
	}
	async content(path) {
		var res = await this.call({
			endpoint: 'metadata/auto' + path,
			method: 'get',
			origin: 'api'
		});
		var json = await res.json();
		return json.contents;
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

var api = new DropboxApi();

async function downloadFile(path) {
	var name = path.split('/').pop();
	var text = await api.download(path);
	await FileUtil.writeFile('books/' + name, text);
	navigate('reader', {bookName: name});
}

class Dropbox extends Component {
	static async routerWillRun() {
		return {
			files: await api.content('/')
		};
	}

	constructor(props) {
		super();
		this.state = {
			files: props.files,
			cursor: '/'
		};
	}
	async updateFiles(cursor) {
		this.setState({
			files: await api.content(cursor),
			cursor: cursor
		});
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

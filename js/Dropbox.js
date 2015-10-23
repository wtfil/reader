var React = require('react-native');
var qs = require('qs');
var {StyleSheet, Text, ListView, View, LinkingIOS, TouchableOpacity, AlertIOS, ActivityIndicatorIOS} = React;
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
				storage.set('dropbox', query);
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

class Dropbox extends React.Component {
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
			cursor: cursor + '/'
		});
	}
	getDs() {
		var ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		return ds.cloneWithRows(this.state.files);
	}
	formatPath(file) {
		var path = file.path.replace(new RegExp('^' + this.state.cursor), '');
		if (file.is_dir) {
			path += '/';
		}
		return path;
	}
	back() {
		var cursor = this.state.cursor.split('/').slice(0, -1).join('/');
		this.updateFiles(cursor);
	}

	downloadFile(path) {
		var name = path.split('/').pop();
		AlertIOS.alert(
			'Download',
			`Download "${name}" in to your library?`,
			[
				{text: 'Ok', onPress: async () => {
					this.setState({load: true});
					var text = await api.download(path);
					await FileUtil.writeFile('books/' + name, text);
					this.setState({load: false});
					navigate('reader', {bookName: name});
				}},
				{text: 'Cancel'}
			]
		);
	}

	render() {
		return <ListView
			style={styles.container}
			dataSource={this.getDs()}
			renderSectionHeader={() => {
				return <View style={styles.head}>
					<Link name="library">
						<Text>Library / </Text>
					</Link>
					<Text style={styles.green}>Dropbox</Text>
					<Text>{this.state.cursor}</Text>
					{this.state.load &&
						<Text style={styles.green}> Loading ... </Text>
					}
				</View>;
			}}
			renderRow={file => {
				return <View>
					<TouchableOpacity onPress={() => {
						if (file.is_dir) {
							this.updateFiles(file.path);
						} else {
							this.downloadFile(file.path);
						}
					}}>
						<Text>{this.formatPath(file)}</Text>
					</TouchableOpacity>
				</View>
			}}
		/>
	}
}

var styles = StyleSheet.create({
	container: {
		paddingHorizontal: 7
	},
	green: {
		color: 'green'
	},
	head: {
		paddingBottom: 10,
		fontSize: 18,
		flexDirection: 'row'
	}
});

module.exports = Dropbox;

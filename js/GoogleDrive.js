var React = require('react-native');
var qs = require('qs');
var {StyleSheet, Text, View, Component, LinkingIOS, AsyncStorage, TouchableOpacity} = React;
var {navigate, Link} = require('./Router');
var {FileUtil} = require('NativeModules');
var api = new GoogleDriveApi();

class GoogleDriveApi {
	constructor() {
		this.CLIENT_ID = '680822659886-int4od5nu4bse0vlc23j20pkk69qti7t.apps.googleusercontent.com';
		this.REDIRECT_URI = 'react-reader://google';
	}
	getToken() {
		if (this.authPromise) {
			return this.authPromise;
		}
		this.authPromise = AsyncStorage.getItem('google')
			.then(data => {
				return JSON.parse(data).access_token;
			})
			.catch(() => {
				var url = 'https://accounts.google.com/o/oauth2/auth?' + qs.stringify({
					client_id: this.CLIENT_ID,
					scope: 'https://www.googleapis.com/auth/drive.file email profile',
					/*immediate: true,*/
					/*include_granted_scopes: true,*/
					/*proxy: 'oauth2relay792730339',*/
					/*redirect_uri: 'urn:ietf:wg:oauth:2.0:oob:auto',*/
					redirect_uri: 'react-reader://google',
					/*origin: 'react-reader://google',*/
					response_type: 'code',
					/*state: '497851694|0.1942314459',*/
					/*authuser: '0'*/
				});
				return new Promise(resolve => {
					LinkingIOS.addEventListener('url', e => {
						console.log(e.url);
						return resolve();
						var query = qs(e.url.split('#')[1]);
						LinkingIOS.removeEventListener('url');
						AsyncStorage.setItem('dropbox', JSON.stringify(query));
						resolve(query.access_token);
					});
					LinkingIOS.openURL(url);
				});
			});
		return this.authPromise;
	}
	/*
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
	*/
}

class GoogleDrive extends React.Component {

	render() {
		api.getToken();
		return null;
	}
}

var styles = StyleSheet.create({
	list: {
		paddingTop: 10
	}
});

module.exports = GoogleDrive;

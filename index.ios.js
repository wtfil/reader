/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var sqlite = require('react-native-sqlite');
var {
  	AppRegistry,
  	StyleSheet,
  	Text,
  	View
} = React;
function dbConnect() {
	if (dbConnect.promise) {
		return dbConnect.promise;
	}
	dbConnect.promise = new Promise(function (resolve, reject) {
		sqlite.open('app.sqlite', function (err, db) {
			if (err) {
				return reject(err);
			}
			resolve(db);
		});
	});
	return dbConnect.promise;
}
function dbCall(query, params) {
	return dbConnect().then(function (db) {
		return new Promise(function (resolve, reject) {
			var rows = [];
			db.executeSQL(
				query,
				params || [],
				rows.push.bind(rows),
				function (err) {
					return err ? reject(err) : resolve(rows);
				}
			);
		});
	});
}

dbCall('select name from sqlite_master where type="table" and name="books"').then(function (data) {
	return data.length || dbCall('create table books(id auto_increment, name varchar(30))');
}).then(function () {
	return dbCall('select * from books');
}).then(function (data) {
	console.log(data);
}).catch(function (err) {
	console.log(err);
});

var AwesomeProject = React.createClass({
  	render: function() {
    	return (
      		<View style={styles.container}>
        		<Text style={styles.welcome}>
          			Welcome to React Native!
        		</Text>
        		<Text style={styles.instructions}>
          			{new Date().toString() + '\n'}
          			To get started, edit index.ios.js{'\n'}
          			Press Cmd+R to reload
        		</Text>
      		</View>
    	);
  	}
});

var styles = StyleSheet.create({
  	container: {
    	flex: 1,
    	justifyContent: 'center',
    	alignItems: 'center',
    	backgroundColor: '#F5FCFF',
  	},
  	welcome: {
    	fontSize: 20,
    	textAlign: 'center',
    	margin: 10,
  	},
  	instructions: {
    	textAlign: 'center',
    	color: '#333333',
  	}
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  	AppRegistry,
  	StyleSheet,
  	Text,
  	View,
  	AsyncStorage
} = React;
AsyncStorage.setItem('start', Date.now());
console.log(AsyncStorage);

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

var React = require('react-native');
var {TouchableOpacity, Navigator, View, Text} = React;
var storage = require('./storage');
var instance;

class Route extends React.Component {}

class ErrorRoute extends React.Component {
	render() {
		return <View style={styles.error}>
			<Text style={styles.errorText}>
				{this.props.error.toString()}
			</Text>
		</View>;
	}
}

class Router extends React.Component {

	constructor (props) {
		if (instance) {
			throw new Error('Only one router could be created');
		}
		super();
		instance = this;
		if (props.handleUncaught) {
			const {constructor} = React.Component.prototype;
			React.Component.prototype.constructor = function () {
				var render = this.render.bind(this);
				this.render = function () {
					try {
						return render();
					} catch (error) {
						instance.setState({
							routeHandler: ErrorRoute,
							routeProps: {error}
						});
						return null;
					};
				}
				constructor.call(this);
			};
		}
		this.state = {
			routeHandler: null,
			routeProps: {}
		};
	}

	async componentWillMount() {
		var lastState = await storage.get('router');
		var route, props;
		if (lastState) {
			route = lastState.route;
			props = lastState.props;
		} else {
			route = [].concat(this.props.children)
				.filter(item => item.props.initial)[0].props.name;
		}
		this.navigate(route, props);
	}

	async navigate(name, props) {
		var Handler = this.getRoute(name);
		var asyncData;

		if (Handler.routerWillRun) {
			try {
				asyncData = await Handler.routerWillRun(props);
			} catch (e) {
				return this.setState({
					routeHandler: ErrorRoute,
					routeProps: {error: e}
				});
			};
		}
		if (this.props.saveLocation) {
			await storage.set('router', {
				route: name,
				props: props
			});
		}
		this.setState({
			routeHandler: Handler,
			routeProps: {...props, ...asyncData}
		});
	}

	getRoute(name) {
		var children = [].concat(this.props.children);
		var item, i;
		for (i = 0; i < children.length; i++) {
			item = children[i];
			if (item.props.name === name) {
				return item.props.handler;
			}
		}
		return null;
	}

	render() {
		return this.state.routeHandler &&
			<this.state.routeHandler {...this.state.routeProps} />;
	}

}

class Link extends React.Component {
	render() {
		return <View style={this.props.style}>
			<TouchableOpacity
				children={this.props.children}
				onPress={() => {
					navigate(this.props.name, this.props.query)
				}}
			/>
		</View>;
	}
}

function navigate(...args) {
	instance.navigate(...args);
}

var styles = {
	error: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#FE2E64',
	},
	errorText: {
		color: '#333',
		fontSize: 21
	}
}

module.exports = {Route, Router, navigate, Link};

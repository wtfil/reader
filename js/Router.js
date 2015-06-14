var React = require('react-native');
var {TouchableOpacity, Navigator, View} = React;
var instance;

class Route extends React.Component {}

class ErrorRoute extends React.Component {
	render() {
		return <View>
			{this.props.error}
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
		this.state = {
			routeHandler: null,
			routeProps: {}
		};
	}

	async navigate(name, props) {
		var handler = this.getRoute(name);
		var asyncData;

		if (handler.routerWillRun) {
			try {
				asyncData = await handler.routerWillRun(props);
			} catch (e) {
				return this.setState({
					routeHandler: ErrorRoute,
					routeProps: {error: e}
				});
			};
		}
		this.setState({
			routeHandler: handler,
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
		/*
		children.forEach(item => {
			if (item.type.prototype.constructor !== Route) {
				throw new Error(`Only <Route/> could be passed to Router, but <${item.type.prototype.constructor.name}/> given`);
			}
		});
		*/
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

module.exports = { Route, Router, navigate, Link };

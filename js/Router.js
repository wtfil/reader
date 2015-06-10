var React = require('react-native');
var {TouchableOpacity, Navigator, View} = React;
var instance;

class Route extends React.Component {}

class Router extends React.Component {

	constructor (props) {
		if (instance) {
			throw new Error('Only one router could be created');
		}
		super();
		instance = this;
		this.state = {
			routeName: props.initialRoute,
			routeProps: {}
		};
	}

	render() {
		var {children} = this.props;
		var item;

		children = [].concat(children);
		children.forEach(item => {
			if (item.type.prototype.constructor !== Route) {
				throw new Error(`Only <Route/> could be passed to Router, but <${item.type.prototype.constructor.name}/> given`);
			}
		});
		for (item of children) {
			if (item.props.name === this.state.routeName) {
				return <item.props.handler {...this.state.routeProps}/>;
			}
		}
		return null;
	}

}

class Link extends React.Component {
	render() {
		return <TouchableOpacity
			style={this.props.style}
			children={this.props.children}
			onPress={() => {
				navigate(this.props.name, this.props.query)
			}}
		/>;
	}
}

function navigate(name, props) {
	instance.setState({
		routeName: name,
		routeProps: props
	});
}

module.exports = { Route, Router, navigate, Link };

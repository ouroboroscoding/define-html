/**
 * Define Node
 *
 * Handles a single define element
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-02-15
 */

// Ouroboros
import { Base } from '@ouroboros/define';
import { empty } from '@ouroboros/tools';

// NPM modules
import PropTypes from 'prop-types';
import React from 'react';

// Types
import {
	labelOptions, onChangeCallback, onEnterPressedCallback, typeOptions,
	variantOptions
} from './';
export type DefineNodeBaseProps = {
	display: Record<string, any>,
	error?: any,
	label?: labelOptions,
	name: string,
	node: Base,
	onChange?: onChangeCallback,
	onEnterPressed?: onEnterPressedCallback,
	placeholder?: string,
	ref?: any,
	type: typeOptions,
	value?: any,
	validation?: boolean,
	variant: variantOptions
}
export type DefineNodeBaseState = {
	error?: string | Record<string, any> | false,
	value: any
}
type RegisterType = {
	class_: typeof DefineNodeBase,
	default_: any
};

/**
 * Define Node Base
 *
 * Base class for all DefineNode types
 *
 * @name DefineNodeBase
 * @access private
 * @extends React.Component
 */
export default class DefineNodeBase extends React.Component {

	// PropTypes data
	static propTypes = {
		display: PropTypes.object.isRequired,
		error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
		name: PropTypes.string.isRequired,
		node: PropTypes.instanceOf(Base).isRequired,
		onChange: PropTypes.func,
		onEnterPressed: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
		placeholder: PropTypes.string,
		type: PropTypes.oneOf(['create', 'search', 'update']).isRequired,
		value: PropTypes.any
	}

	// Registered components
	static _plugins: Record<string, RegisterType> = {};

	// Props type
	declare props: DefineNodeBaseProps;

	// State type
	state: DefineNodeBaseState;

	// Registered Node types
	static pluginAdd(name: string, componentClass: typeof DefineNodeBase, defaultValue: any = '') {
		DefineNodeBase._plugins[name] = {
			class_: componentClass,
			default_: defaultValue,
		}
	}

	/**
	 * Constructor
	 *
	 * Creates a new instance
	 *
	 * @name DefineNodeBase
	 * @access public
	 * @param props Properties passed to the component
	 * @returns a new instance
	 */
	constructor(props: DefineNodeBaseProps) {

		// Call the React parent component
		super(props);

		// Set the base state
		this.state = {
			error: false,
			value: props.value === undefined ? null : props.value
		}

		// Bind the methods
		this.keyPressed = this.keyPressed.bind(this);
	}

	/**
	 * Component Did Update
	 *
	 * Called when props passed to the component have changed
	 *
	 * @name componentDidUpdate
	 * @access public
	 * @param prevProps The previous prop values
	 */
	componentDidUpdate(prevProps: DefineNodeBaseProps) {

		// Init the new state
		const oState: Record<string, any> = {};

		// If the error changed
		if(prevProps.error !== this.props.error) {
			oState.error = this.props.error;
		}

		// If the value changed
		if(prevProps.value !== this.props.value) {
			oState.value = this.props.value;
		}

		// If we have changes, set the new state
		if(!empty(oState)) {
			this.setState(oState);
		}
	}

	/**
	 * Error
	 *
	 * Called to display an error associated with the Node
	 *
	 * @name error
	 * @access public
	 * @param msg The error message
	 */
	error(error: any): void {
		this.setState({ error });
	}

	/**
	 * Key Pressed
	 *
	 * Called to trap Enter key presses
	 *
	 * @name keyPressed
	 * @access public
	 * @param event The event, aka, the key pressed
	 */
	keyPressed(event: React.KeyboardEvent<HTMLInputElement>): void {
		if(event.key === 'Enter' && this.props.onEnterPressed) {
			this.props.onEnterPressed();
		}
	}

	/**
	 * Reset
	 *
	 * Called to reset the value without triggering an error from the Node
	 *
	 * @name reset
	 * @access public
	 */
	reset(): void {
		this.setState({
			value: this.props.value === undefined ? null : this.props.value,
			error: false
		});
	}

	/**
	 * Value (get)
	 *
	 * Returns the current value of the component
	 *
	 * @name value
	 * @property
	 * @returns the current value
	 */
	get value(): any {
		return this.state.value === '' ? null : this.state.value;
	}

	/**
	 * Value (set)
	 *
	 * Sets the current value
	 *
	 * @name value
	 * @property
	 */
	set value(val: any) {

		const oState: DefineNodeBaseState = {value: val};

		// Make sure it's valid
		if(this.props.node.valid(val)) {
			oState.error = false;
		} else {
			oState.error = this.props.node.validationFailures[0][1]
		}

		// If anyone is interested
		if(this.props.onChange) {

			// Store the old value
			const mOld = this.state.value;
			const fCallback = this.props.onChange;

			// Set the state and track when it's done
			this.setState(oState, () => {

				// Let whoever is interested in the change know
				fCallback(val, mOld);
			});
		}

		// Else, just set the state
		else {
			this.setState(oState);
		}
	}
}
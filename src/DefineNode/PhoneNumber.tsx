/**
 * Define Node Phone Number
 *
 * Handles a single string define element
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-02-17
 */

// NPM modules
import React from 'react';
import { PatternFormat, NumberFormatValues } from 'react-number-format';

// Local components
import DefineNodeBase from './Base';

// Types
import { DefineNodeBaseProps } from './Base';

/**
 * Node Phone Number
 *
 * Handles values that are phone numbers
 *
 * @name DefineNodePhoneNumber
 * @access public
 * @extends DefineNodeBase
 */
export default class DefineNodePhoneNumber extends DefineNodeBase {

	/**
	 * Constructor
	 *
	 * Creates a new instance
	 *
	 * @name DefineNodePhoneNumber
	 * @access public
	 * @param props Properties passed to the component
	 * @returns a new instance
	 */
	constructor(props: DefineNodeBaseProps) {
		super(props);
		this.change = this.change.bind(this);
	}

	/**
	 * Change
	 *
	 * Called when the node value changes
	 *
	 * @name change
	 * @access public
	 * @param value The new phone number
	 */
	change(o: NumberFormatValues): void {

		// Store the value
		let sValue = o.value;

		// If there's a callback
		if(this.props.onChange) {
			const mResult = this.props.onChange(sValue, this.state.value);
			if(mResult !== undefined) {
				sValue = mResult;
			}
		}

		// Check the new value is valid
		let error: string | false = false;
		if(this.props.validation && !this.props.node.valid(sValue)) {
			error = this.props.node.validationFailures[0][1];
		}

		// Update the state
		this.setState({
			error,
			value: sValue
		});
	}

	/**
	 * Render
	 *
	 * Generates the actual DOM elements of the component
	 *
	 * @name render
	 * @access public
	 */
	render() {

		// If there's an error, and we have custom error messages, and the error
		//	is in the list, use it instead of the default string
		let sError = this.state.error;
		if(typeof this.state.error === 'string') {
			sError = this.props.display.__errors__ && this.state.error in this.props.display.__errors__ ?
						this.props.display.__errors__[this.state.error] :
						this.state.error;
		}

		// Render
		return <>
			{this.props.label === 'above' &&
				<label htmlFor={this.props.name}>{this.props.display.__title__}</label>
			}
			<PatternFormat
				allowEmptyFormatting
				className={`form-field field-${this.props.name} node-phone-number`}
				format="1 (###) ### ####"
				mask="_"
				onValueChange={this.change}
				value={this.state.value === null ? '' : this.state.value}
			/>
			{sError &&
				<p className="define-error">{sError as string}</p>
			}
		</>;
	}
}

// Register with Node
DefineNodeBase.pluginAdd('phone_number', DefineNodePhoneNumber);
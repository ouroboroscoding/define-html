/**
 * Define Node Password
 *
 * Handles a single string define element
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-02-17
 */

// Ouroboros modules
import { Node } from '@ouroboros/define';

// NPM modules
import React, { InputHTMLAttributes } from 'react';

// Local components
import DefineNodeBase from './Base';

// Types
import { DefineNodeBaseProps } from './Base';

/**
 * Node Password
 *
 * Handles values that are strings or string-like
 *
 * @name DefineNodePassword
 * @access public
 * @extends DefineNodeBase
 */
export default class DefineNodePassword extends DefineNodeBase {

	/**
	 * Constructor
	 *
	 * Creates a new instance
	 *
	 * @name DefineNodePassword
	 * @access public
	 * @param props Properties passed to the component
	 * @returns a new instance
	 */
	constructor(props: DefineNodeBaseProps) {
		super(props);

		// If there's a regex, override the node
		if('__regex__' in props.display) {
			(props.node as Node).regex(props.display.__regex__);
		}

		// Bind methods
		this.change = this.change.bind(this);
	}

	/**
	 * Change
	 *
	 * Called when the node value changes
	 *
	 * @name change
	 * @access public
	 * @param event The event triggered by the change
	 */
	change(event: React.ChangeEvent<HTMLInputElement>): void {

		// Store the value
		let sValue = event.target.value;

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

		// Initial props
		const props: InputHTMLAttributes<HTMLInputElement> = {
			className: `form-field field-${this.props.name} node-password`,
			id: this.props.name,
			onKeyDown: this.keyDown,
			onChange: this.change,
			placeholder: (this.props.label === 'placeholder')
				? this.props.placeholder || this.props.display.__title__
				: this.props.placeholder,
			type: 'password',
			value: this.state.value === null ? '' : this.state.value
		}

		// Render
		return <>
			{this.props.label === 'above' &&
				<label htmlFor={this.props.name}>
					{this.props.display.__title__}
				</label>
			}
			<input {...props} />
			{sError &&
				<p className="define-error">{sError as string}</p>
			}
		</>;
	}
}

// Register with Node
DefineNodeBase.pluginAdd('password', DefineNodePassword);
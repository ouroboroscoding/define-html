/**
 * Define Node TextArea
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
import { Types } from '@ouroboros/define';
import { DefineNodeBaseProps } from './Base';

/**
 * Node TextArea
 *
 * Handles values that are strings or string-like over multiple lines
 *
 * @name DefineNodeTextArea
 * @access public
 * @extends DefineNodeBase
 */
export default class DefineNodeTextArea extends DefineNodeBase {

	/**
	 * Constructor
	 *
	 * Creates a new instance
	 *
	 * @name DefineNodeTextArea
	 * @access public
	 * @param props Properties passed to the component
	 * @returns a new instance
	 */
	constructor(props: DefineNodeBaseProps) {

		// Call the base
		super(props);

		// If there's a regex, override the node
		if('__regex__' in props.display) {
			(props.node as Node).regex(props.display.__regex__);
		}

		// Bind the methods
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
	change(event: React.ChangeEvent<HTMLTextAreaElement>): void {

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
		if(this.props.validation &&
			!this.props.node.valid(sValue === '' ? null : sValue)) {
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
		const props: InputHTMLAttributes<HTMLTextAreaElement> = {
			className: 'form-input',
			onChange: this.change,
			placeholder: (this.props.label === 'placeholder')
				? this.props.placeholder || this.props.display.__title__
				: this.props.placeholder,
			value: this.state.value === null ? '' : this.state.value
		}


		// If there's a max, add it to props
		const minmax = (this.props.node as Node).minmax() as Types.MinMax;
		if(minmax.maximum) {
			props.maxLength = minmax.maximum;
		}

		// Render
		return (
			<div className={`form-field field-${this.props.name} node-textarea`}>
				{this.props.label === 'above' &&
					<label htmlFor={this.props.name}>{this.props.display.__title__}</label>
				}
				<textarea {...props} />
				{props.maxLength &&
					<div className="define-textarea-count">
						{(props.value as string).length} / {props.maxLength}
					</div>
				}
				{sError &&
					<p className="define-error">{sError as string}</p>
				}
			</div>
		);
	}
}

// Register with Node
DefineNodeBase.pluginAdd('textarea', DefineNodeTextArea);
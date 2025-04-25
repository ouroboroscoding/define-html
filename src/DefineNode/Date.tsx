/**
 * Define Node Date
 *
 * Handles a single date define element
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-02-17
 */

// NPM modules
import React from 'react';

// Local components
import DefineNodeBase, { DefineNodeBaseProps } from './Base';

/**
 * Node Date
 *
 * Handles values that represent a date
 *
 * @name DefineNodeDate
 * @access public
 * @extends DefineNodeBase
 */
export default class DefineNodeDate extends DefineNodeBase {

	/**
	 * Constructor
	 *
	 * Creates a new instance
	 *
	 * @name DefineNodeDate
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

		// Render
		return (
			<div className={`form-field field_${this.props.name} node-date`}>
				{this.props.label === 'above' &&
					<p className="label">{this.props.display.__title__}</p>
				}
				<input
					className="form-input"
					onKeyPress={this.keyPressed}
					onChange={this.change}
					type="date"
					value={this.state.value === null ? '' : this.state.value}
				/>
				{sError !== false &&
					<p className="error">{sError as string}</p>
				}
			</div>
		);
	}
}

// Register with Node
DefineNodeBase.pluginAdd('date', DefineNodeDate);
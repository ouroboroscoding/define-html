/**
 * Define Node Time
 *
 * Handles a single time define element
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-02-17
 */

// NPM modules
import React from 'react';

// Local components
import DefineNodeBase from './Base';

// Types
import { DefineNodeBaseProps } from './Base';

/**
 * Node Time
 *
 * Handles values that represent a time
 *
 * @name DefineNodeTime
 * @access public
 * @extends DefineNodeBase
 */
export default class DefineNodeTime extends DefineNodeBase {

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

		// Check the new value is valid
		let sValue = event.target.value + ':00';

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
			<div className={`form-field field-${this.props.name} node-time`}>
				{this.props.label === 'above' &&
					<label htmlFor={this.props.name}>{this.props.display.__title__}</label>
				}
				<input
					className="form-input"
					onChange={this.change}
					onKeyDown={this.keyDown}
					type="time"
					value={this.state.value === null ? '' : this.state.value}
				/>
				{sError &&
					<p className="define-error">{sError as string}</p>
				}
			</div>
		);
	}
}

// Register with Node
DefineNodeBase.pluginAdd('time', DefineNodeTime);
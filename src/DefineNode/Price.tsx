/**
 * Define Node Price
 *
 * Handles a single price define element
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-02-17
 */

// Ouroboros modules
import { Node } from '@ouroboros/define';

// NPM modules
import React from 'react';
import {
	NumericFormat, NumericFormatProps, NumberFormatValues
} from 'react-number-format';

// Local components
import DefineNodeBase from './Base';

// Types
import { Types } from '@ouroboros/define';
import { DefineNodeBaseProps } from './Base';

/**
 * Node Price
 *
 * Handles values that represent numbers (ints, floats, decimal)
 *
 * @name DefineNodePrice
 * @access public
 * @extends DefineNodeBase
 */
export default class DefineNodePrice extends DefineNodeBase {

	/**
	 * Constructor
	 *
	 * Creates a new instance
	 *
	 * @name DefineNodePrice
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

		// If we have an adornment override
		let sAdornment = '$';
		if(this.props.display.__adornment__) {
			sAdornment = this.props.display.__adornment__;
		}

		// Initial props
		const props: NumericFormatProps = {
			allowNegative: false,
			className: 'form-input',
			decimalScale: 2,
			id: this.props.name,
			inputMode: 'decimal',
			onKeyDown: this.keyDown,
			onValueChange: this.change,
			placeholder: (this.props.label === 'placeholder')
				? this.props.placeholder || this.props.display.__title__
				: this.props.placeholder,
			prefix: sAdornment,
			thousandSeparator: true,
			value: this.state.value === null ? '' : this.state.value,
		}

		// Check for min/max
		const minmax = (this.props.node as Node).minmax() as Types.MinMax;
		if(minmax.minimum) {
			props.min = minmax.minimum;
		}
		if(minmax.maximum) {
			props.max = minmax.maximum;
		}

		// Render
		return (
			<div className={`form-field field-${this.props.name} node-price`}>
				{this.props.label === 'above' &&
					<label htmlFor={this.props.name}>
						{this.props.display.__title__}
					</label>
				}
				<NumericFormat {...props} />
				{sError &&
					<p className="define-error">{sError as string}</p>
				}
			</div>
		);
	}
}

// Register with Node
DefineNodeBase.pluginAdd('price', DefineNodePrice);
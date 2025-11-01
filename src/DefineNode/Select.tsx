/**
 * Define Node Select
 *
 * Handles a single define element with multiple static or dynamic options
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-02-17
 */

// Ouroboros modules
import { Node } from '@ouroboros/define';
import Subscribe, {
	SubscribeCallback, SubscribeReturn
} from '@ouroboros/subscribe';
import { afindi } from '@ouroboros/tools';

// NPM modules
import React from 'react';

// Local components
import DefineNodeBase from './Base';

// Types
import { DefineNodeBaseProps, DefineNodeBaseState } from './Base';

// Types
type DefineNodeSelectState = {
	options: string[][] | string[]
}

/**
 * Node Select
 *
 * Handles values that have specific options
 *
 * @name DefineNodeSelect
 * @access public
 * @extends DefineNodeBase
 */
export default class DefineNodeSelect extends DefineNodeBase {

	// Props type
	declare props: DefineNodeBaseProps;

	// State type
	declare state: DefineNodeSelectState & DefineNodeBaseState;

	// Callback for dynamic data
	callback: SubscribeCallback;

	// Subscribe return
	subscribe: SubscribeReturn;

	/**
	 * Constructor
	 *
	 * Creates a new instance
	 *
	 * @name DefineNodeSelect
	 * @access public
	 * @param props Properties passed to the component
	 * @returns a new instance
	 */
	constructor(props: DefineNodeBaseProps) {

		// Call parent
		super(props);

		// If we have display options
		let lDisplayOptions = props.display.__options__;

		// If we got data
		if(lDisplayOptions) {

			// If the options are a dynamic Subscribe
			if(lDisplayOptions instanceof Subscribe) {
				this.callback = this.dynamicData.bind(this);
				lDisplayOptions = [];
			}

			// Else, if we have a list but the elements aren't lists
			else if(typeof lDisplayOptions[0] === 'string') {
				lDisplayOptions = lDisplayOptions.map((s: string) => [s, s]);
			}
		}
		// Else, get the options from the node
		else {

			// Try to get the Node options
			const lNodeOptions = (this.props.node as Node).options();

			// If any exist, use them to set the dialog options
			if(lNodeOptions) {
				lDisplayOptions = lNodeOptions.map(s => [s, s]);
			}
		}

		// Set the state options
		this.state.options = lDisplayOptions;

		// Bind methods
		this.change = this.change.bind(this);
	}

	/**
	 * Component Did Mount
	 *
	 * Called right after the component is added to the DOM
	 *
	 * @name componentDidMount
	 * @access public
	 */
	componentDidMount(): void {

		// If there's a callback for dynamic options
		if(this.callback) {

			// Subscribe to the changes in options
			this.subscribe = this.props.display.__options__.subscribe(
				this.callback
			);

			// Make sure we have an array of arrays of strings
			let lData: string[][];

			// If we got an array of strings
			if(typeof this.subscribe.data[0] === 'string') {
				lData = this.subscribe.data.map(
					(s: string) => [ s, s ]
				) as string[][];
			} else {
				lData = this.subscribe.data as string[][];
			}

			// Store the current options
			this.setState({ options: lData });
		}
	}

	/**
	 * Component Will Unmount
	 *
	 * Called right before the component is removed from the DOM
	 *
	 * @name componentWillUnmount
	 * @access public
	 */
	componentWillUnmount() {

		// If there's a subscribe value
		if(this.subscribe) {

			// Stop tracking
			this.subscribe.unsubscribe();
		}
	}

	/**
	 * Dyanamic Data
	 *
	 * Called by the Options instance when there's new options data
	 *
	 * @name dynamicData
	 * @access public
	 * @param data The new options data
	 */
	dynamicData(data: string[] | string[][]) {

		// Make sure we have an array of arrays of strings
		let lData: string[][];

		// If we got an array of strings
		if(typeof data[0] === 'string') {
			lData = data.map(s => [s, s]) as string[][];
		} else {
			lData = data as string[][];
		}

		// Init the new state
		const oState: Record<string, any> = { options: lData };

		// If we have an existing value
		if(this.state.value !== '' && this.state.value !== null) {

			// If the current value doesn't match the list
			if(afindi(lData, 0, this.state.value) === -1) {
				oState.value = '';
			}
		}

		// Else, if we have a prop value
		else if(this.props.value !== '' && this.props.value !== null) {

			// If the current value doesn't match the list
			if(afindi(lData, 0, this.props.value) > -1) {
				oState.value = this.props.value;
			}
		}

		// Set the new state
		this.setState(oState);
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
	change(event: React.ChangeEvent<HTMLSelectElement>): void {

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

		// Init the option elements
		const lOpts = [<option key={0} value=''></option>];

		// Add the other options
		let i = 1;
		for(const o of this.state.options) {
			lOpts.push(<option key={i} value={o[0]}>{o[1]}</option>);
			++i;
		}

		return (
			<div className={`form-field field-${this.props.name} node-select`}>
				{this.props.label === 'above' &&
					<label htmlFor={this.props.name}>
						{this.props.display.__title__}
					</label>
				}
				<select
					id={this.props.name}
					onChange={this.change}
					value={this.state.value === null ? '' : this.state.value}
				>
					{lOpts}
				</select>
				{sError &&
					<p className="define-error">{sError as string}</p>
				}
			</div>
		);
	}

	/**
	 * Options (set)
	 *
	 * Sets the new options for the dialog
	 *
	 * @name options
	 * @property
	 */
	set options(data: string[][]) {
		this.setState({ options: data });
	}
}

// Register with Node
DefineNodeBase.pluginAdd('select', DefineNodeSelect);
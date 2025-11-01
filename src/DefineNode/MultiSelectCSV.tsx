/**
 * Define Node Multi Select CSV
 *
 * Handles a single string comprised of comma seperated values
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-02-17
 */

// Ouroboros modules
import { Node } from '@ouroboros/define';
import Modal from '@ouroboros/react-modal';
import Subscribe, {
	SubscribeCallback, SubscribeReturn
} from '@ouroboros/subscribe';

// NPM modules
import React, { InputHTMLAttributes } from 'react';

// Local components
import DefineNodeBase from './Base';

// Types
import { DefineNodeBaseProps, DefineNodeBaseState } from './Base';

// Types
type DefineNodeMultiSelectCSVState = {
	defaultValues: string[] | null,
	options: string[][]
}

/**
 * Node MultiSelectCSV
 *
 * Handles values that aren't visible
 *
 * @name DefineNodeMultiSelectCSV
 * @access public
 * @extends DefineNodeBase
 */
export default class DefineNodeMultiSelectCSV extends DefineNodeBase {

	// Props type
	declare props: DefineNodeBaseProps;

	// State type
	declare state: DefineNodeMultiSelectCSVState & DefineNodeBaseState;

	// Callback for setting dynamic options
	callback: SubscribeCallback;

	// List of Checkbox elements
	checks: HTMLInputElement[]

	// Subscribe data
	subscribe: SubscribeReturn;

	/**
	 * Constructor
	 *
	 * Creates a new instance
	 *
	 * @name DefineNodeMultiSelectCSV
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

			// If the options are a dynamic Subscribe instance
			if(lDisplayOptions instanceof Subscribe) {
				this.callback = this.dynamicData.bind(this);
				lDisplayOptions = [ ];
			}
		}
		// Else, get the options from the node
		else {

			// Try to get the Node options
			const lNodeOptions = (this.props.node as Node).options();

			// If any exist, use them to set the dialog options
			if(lNodeOptions) {
				lDisplayOptions = lNodeOptions.map(s => [ s, s ]);
			}
		}

		// Set the state options
		this.state.defaultValues = null;
		this.state.options = lDisplayOptions;

		// Refs
		this.checks = [];

		// Bind methods
		this.cancel = this.cancel.bind(this);
		this.open = this.open.bind(this);
		this.submit = this.submit.bind(this);
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

			// Store the current options
			this.setState({ options: this.subscribe.data });
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
	 * Cancel
	 *
	 * Called to close the dialog
	 *
	 * @name cancel
	 * @access public
	 */
	cancel(): void {
		this.setState({ defaultValues: null });
	}

	/**
	 * Open
	 *
	 * Called to open the dialog
	 *
	 * @name open
	 * @access public
	 */
	open(): void {
		this.setState({
			defaultValues: this.state.value.split(
				this.props.display.extra_space ? ', ' : ','
			)
		});
	}

	/**
	 * Submit
	 *
	 * Called to set the new data in the node
	 *
	 * @name submit
	 * @access public
	 */
	submit(): void {

		// Init the values
		const lValues = [ ];

		// Go through each ref
		for(const o of this.checks) {
			if(o.checked) {
				lValues.push(o.value);
			}
		}

		// Combine the values
		let sValue = lValues.join(
			this.props.display.extra_space ? ', ' : ','
		);

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
			defaultValues: null,
			error,
			value: sValue
		});
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
	dynamicData(data: string[][]): void {
		this.setState({ options: data });
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

		// Clear refs
		this.checks = [];

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
			className: `form-field field-${this.props.name} node-multiselectcsv`,
			id: this.props.name,
			onClick: this.open,
			placeholder: (this.props.label === 'placeholder')
				? this.props.placeholder || this.props.display.__title__
				: this.props.placeholder,
			readOnly: true,
			type: 'text',
			style: { cursor: 'pointer' },
			value: this.state.value === null ? '' : this.state.value
		}

		return <>
			{this.props.label === 'above' &&
				<label htmlFor={this.props.name}>{this.props.display.__title__}</label>
			}
			<input {...props} />
			{sError &&
				<p className="define-error">{sError as string}</p>
			}
			{this.state.defaultValues !== null &&
				<Modal
					maxWidth={1200}
					onClose={this.cancel}
				>
					<div className="define-modal-title">
						{this.props.display.__title__}
					</div>
					<div className="grid spacing-6">
						{this.state.options.map(o =>
							<div
								className="grid-item xs-12 md-4 lg-2"
								key={o[0]}
							>
								<label>
									<input
										defaultChecked={(this.state.defaultValues as string[]).includes(o[0]) ? true : false}
										ref={ref => this.checks.push(ref as HTMLInputElement)}
										type="checkbox"
									/>
									{o[1]}
								</label>
							</div>
						)}
					</div>
					<div className="define-modal-actions">
						<button
							className="define-modal-button-submit"
							onClick={this.submit}
						>Submit</button>
					</div>
				</Modal>
			}
		</>;
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
DefineNodeBase.pluginAdd('hidden', DefineNodeMultiSelectCSV);
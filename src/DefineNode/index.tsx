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
import { empty, isObject, merge, ucfirst } from '@ouroboros/tools';
import { Node } from '@ouroboros/define';

// NPM modules
import PropTypes from 'prop-types';
import React from 'react';

// Local modules
import DefineBase from '../DefineBase';
import DefineNodeBase from './Base';
import DefineNodeSearchOption from './SearchOption';

// Node types
import DefineNodeBool from './Bool';
import DefineNodeDate from './Date';
import DefineNodeDatetime from './Datetime';
import DefineNodeHidden from './Hidden';
import DefineNodeMultiSelectCSV from './MultiSelectCSV';
import DefineNodeNumber from './Number';
import DefineNodePassword from './Password';
import DefineNodePhoneNumber from './PhoneNumber';
import DefineNodePrice from './Price';
import DefineNodeSelect from './Select';
import DefineNodeText from './Text';
import DefineNodeTextArea from './TextArea';
import DefineNodeTime from './Time';
import DefineNodeTimestamp from './Timestamp';

// Export Node types
export {
	DefineNodeBase, DefineNodeBool, DefineNodeDate, DefineNodeDatetime,
	DefineNodeHidden, DefineNodeMultiSelectCSV, DefineNodeNumber,
	DefineNodePassword, DefineNodePhoneNumber, DefineNodePrice,
	DefineNodeSelect, DefineNodeText, DefineNodeTextArea, DefineNodeTime,
	DefineNodeTimestamp
}

// Types
//	Options
export type labelOptions = 'above' | 'none' | 'placeholder';
export type typeOptions = 'create' | 'search' | 'update';
export type variantOptions = 'filled' | 'outlined' | 'standard';
//	Callbacks
export type onChangeCallback = (value: any, oldValue: any) => void;
export type onEnterPressedCallback = () => void;
//	Props
export type DefineNodeProps = {
	display?: Record<string, any>,
	error: string | false,
	label?: labelOptions,
	name: string,
	node: Node,
	onChange?: onChangeCallback,
	onEnterPressed?: onEnterPressedCallback,
	placeholder?: string,
	ref?: any,
	type: typeOptions,
	value?: any,
	validation?: boolean,
	variant: variantOptions
};
//	State
type DefineNodeState = {
	display: Record<string, any>,
	type: string,
	value?: any
};

/**
 * DefineNode
 *
 * Wrapper for all the different types of simple data
 *
 * @name DefineNode
 * @access public
 * @extends DefineBase
 */
export default class DefineNode extends DefineBase {

	// PropTypes data
	static propTypes = {
		display: PropTypes.object,
		error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
		label: PropTypes.oneOf(['above', 'none', 'placeholder']),
		name: PropTypes.string.isRequired,
		node: PropTypes.instanceOf(Node).isRequired,
		onChange: PropTypes.func,
		onEnterPressed: PropTypes.func,
		placeholder: PropTypes.string,
		type: PropTypes.oneOf(['create', 'search', 'update']).isRequired,
		value: PropTypes.any,
		validation: PropTypes.bool,
		variant: PropTypes.oneOf(['filled', 'outlined', 'standard'])
	}
	static defaultProps = {
		error: false,
		label: 'placeholder',
		value: null,
		validation: true,
		variant: 'outlined'
	}

	// Registered Node types
	static pluginAdd(name: string, componentClass: typeof DefineNodeBase, defaultValue: any = '') {
		DefineNodeBase.pluginAdd(name, componentClass, defaultValue);
	}

	// The components current state
	declare props: DefineNodeProps;
	state: DefineNodeState;

	// Child elements
	_el: DefineNodeBase | null;
	_search: DefineNodeSearchOption | null;

	/**
	 * Constructor
	 *
	 * Creates a new instance
	 *
	 * @name DefineNode
	 * @access public
	 * @param props Properties passed to the component
	 * @returns a new instance
	 */
	constructor(props: DefineNodeProps) {

		// Call parent
		super(props);

		// Set initial state
		this.state = this.generateState();

		// Add the value
		this.state.value = props.value !== null ? props.value : this.state.display.__default__

		// Child elements
		this._el = null;
		this._search = null;
	}

	/**
	 * Component Did Mount
	 *
	 * Called right after the component is added to the DOM
	 *
	 * @name componentDidMount
	 * @access public
	 * @param prevProps The previously set properties
	 */
	componentDidUpdate(prevProps: DefineNodeProps) {

		// Init the new state from the old
		let oState: Record<string, any> = {};

		// If the Node changed, or the display overrides changed
		if(prevProps.node !== this.props.node ||
			prevProps.display !== this.props.display) {

			// Overwrite the entire state
			oState = this.generateState();
		}

		// If the value changed, update it in the state
		if(prevProps.value !== this.props.value) {
			oState.value = this.props.value;
		}

		// If we have changes, set the new state
		if(!empty(oState)) {
			this.setState(oState);
		}
	}

	/**
	 * Default Type
	 *
	 * Returns the element type associated with the Node's type. Useful when
	 * there's no custom type to handle the render
	 *
	 * @name defaultType
	 * @param node The Node associated with the element
	 * @returns string
	 */
	defaultType(node: Node) {

		// If it has options, it's a select, no question
		if(node.options()) {
			return 'select';
		}

		// Get the node type
		const sType = node.type();

		// Figure it out by type
		switch(sType) {

			// If it's a string type at its core
			case 'any':
			case 'base64':
			case 'ip':
			case 'json':
			case 'md5':
			case 'string':
			case 'tuuid':
			case 'tuuid4':
			case 'uuid':
			case 'uuid4':
				return 'text';

			// If it's a number
			case 'decimal':
			case 'float':
			case 'int':
			case 'uint':
				return 'number';

			// It it's a timestamp
			case 'timestamp':
				return 'timestamp';

			// Else it's its own type
			case 'bool':
			case 'date':
			case 'datetime':
			case 'price':
			case 'time':
				return sType;

			default:
				throw new Error(`Invalid type in format/Node: ${sType}`);
		}
	}

	/**
	 * Error
	 *
	 * Called to set the error on the node
	 *
	 * @name error
	 * @access public
	 * @param msg The error message
	 */
	error(msg: string) {
		if(this._el) {
			this._el.error(msg);
		}
	}

	/**
	 * Generate State
	 *
	 * Checks the node for data and generates the state that will be used in the
	 * component
	 *
	 * @name generateState
	 * @access public
	 * @returns the state to use
	 */
	generateState(): DefineNodeState {

		// Get the react display properties
		const oUI = this.props.node.special('ui') || {}

		// If we have overrides
		if(this.props.display) {
			merge(oUI, this.props.display);
		}

		// If the title is not set
		if(!('__title__' in oUI)) {
			oUI.__title__ = ucfirst(this.props.name);
		}

		// If there's no default
		if(!('__default__' in oUI)) {
			oUI.__default__ = null;
		}

		// Return the new state
		return {
			display: oUI,
			type: '__type__' in oUI ?
					oUI.__type__ :
					this.defaultType(this.props.node),
		}
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

		// Get the component name based on the type
		let ElName: typeof DefineNodeBase | null = null;
		if(this.state.type in DefineNodeBase._plugins) {
			ElName = DefineNodeBase._plugins[this.state.type].class_;
		} else {
			throw new Error(`Invalid type in define/Node: ${this.state.type}`);
		}

		// Get the value
		const mValue = this.state.value !== null ?
						this.state.value :
						DefineNodeBase._plugins[this.state.type].default_;

		return (
			<React.Fragment>
				<ElName
					display={this.state.display}
					error={this.props.error}
					label={this.props.label}
					onChange={this.props.onChange}
					onEnterPressed={this.props.onEnterPressed}
					name={this.props.name}
					node={this.props.node}
					ref={(el: DefineNodeBase) => this._el = el}
					type={this.props.type}
					value={mValue}
					validation={this.props.validation}
					variant={this.props.variant}
				/>
				{this.props.type === 'search' &&
					<DefineNodeSearchOption
						ref={(el: DefineNodeSearchOption) => this._search = el}
						type={this.state.type}
						variant={this.props.variant}
					/>
				}
			</React.Fragment>
		);
	}

	/**
	 * Reset
	 *
	 * Resets the value on a Node without triggering error checking
	 *
	 * @name reset
	 * @access public
	 */
	reset(): void {
		if(this._el) {
			this._el.reset();
		}
	}

	/**
	 * Value (get)
	 *
	 * Returns the current value of the node
	 *
	 * @name value
	 * @property
	 * @returns the current value
	 */
	get value(): any | null {

		// If we don't have the element
		if(!this._el) {
			return null;
		}

		// Get the value of the element
		const mValue = this._el.value;

		// If the value is null
		if(mValue === null) {
			return null;
		}

		// If we're not in search mode, return the value as is
		if(this.props.type !== 'search') {
			return mValue;
		}

		// Get the value of the search select
		const sSearch = (this._search as DefineNodeSearchOption).value;

		// If it's null or exact, return the value as is
		if(sSearch === null || sSearch === 'exact') {
			return mValue;
		}

		// Else, generate an object describing the search
		else {
			return {
				type: sSearch,
				value: this._el.value
			}
		}
	}

	/**
	 * Value (set)
	 *
	 * Sets the new value on the node
	 *
	 * @name value
	 * @property
	 * @param val The new value to set
	 */
	set value(val: any | null) {

		// If we're not in search mode, set the value as is
		if(this.props.type !== 'search') {
			(this._el as DefineNodeBase).value = val;
			return;
		}

		// If we didn't get an object, assume exact
		if(!isObject(val)) {
			(this._el as DefineNodeBase).value = val;
			(this._search as DefineNodeSearchOption).value = 'exact';
			return;
		}

		// Set the value and search dropdown
		(this._el as DefineNodeBase).value = val.value;
		(this._search as DefineNodeSearchOption).value = val.type;
	}
}

// Register the component with the generator
DefineBase.register('Node', DefineNode);
/**
 * Define Parent
 *
 * Handles groups of define nodes
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-02-17
 */

// Ouroboros
import { compare, empty, merge, opop } from '@ouroboros/tools';
import { Parent } from '@ouroboros/define';

// NPM modules
import PropTypes from 'prop-types';
import React from 'react';

// Components
import DefineBase from './DefineBase';
import { DefineNodeBase } from './DefineNode';
import { Hash as OptionsHash } from './Options';

// Modules
import { errorTree } from './Shared';

// Types
import type { Node } from '@ouroboros/define';
import type {
	DefineBaseProps, gridSizesByNodeStruct, gridSizesStruct
} from './DefineBase';
import type { HashArg } from './Options/Hash';
import type { DefineNodeBaseProps } from './DefineNode/Base';
import { DefineNodeProps, onChangeCallback } from './DefineNode';
export type dynamicOptionStruct = {
	node: string,
	trigger: string,
	options: HashArg
}
export type onNodeChangeCallback =
	(event: ParentNodeChangeEvent) => void | Record<string, any>;
export type ParentNodeChangeEvent = {
	data: Record<string, any>,
	node: string,
	oldValue: any,
	value: any
};
export type DefineParentProps = DefineBaseProps & {
	dynamicOptions?: dynamicOptionStruct[],
	fields?: string[],
	node: Parent,
	onNodeChange?: Record<string, onChangeCallback>
	root?: boolean,
	value: Record<string, any>
};
type DefineParentState = {
	display: Record<string, any>,
	elements?: JSX.Element[],
	order?: string[],
	plugin: typeof DefineNodeBase | null,
	title: string | false
}
type pluginsType = Record<string, typeof DefineNodeBase>;

// Registered components
const _plugins: pluginsType = {};

/**
 * Sizes to Classes
 *
 * Generates a string of grid item class names based on the grid sizes set
 *
 * @name sizesToClasses
 * @access private
 * @param sz The grid sizes set
 * @returns string
 */
function sizesToClasses(sz: gridSizesStruct): string {
	return Object.entries(sz).map(([k,v]) => `${k}-${v}`).join(' ');
}

/**
 * Parent
 *
 * Creates a grid of Nodes using the FormatOC Parent structure
 *
 * @name DefineParent
 * @access public
 * @extends DefineBase
 */
export default class DefineParent extends DefineBase {

	// Called to add an external Component to the list available
	static pluginAdd(type: string, classConstructor: typeof DefineNodeBase) {
		_plugins[type] = classConstructor;
	}

	// Props Types
	static propTypes = {
		display: PropTypes.object,
		dynamicOptions: PropTypes.arrayOf(PropTypes.exact({
			node: PropTypes.string.isRequired,
			trigger: PropTypes.string.isRequired,
			options: PropTypes.oneOfType(
				[ PropTypes.object, PropTypes.func ]
			).isRequired
		})),
		error: PropTypes.object,
		fields: PropTypes.arrayOf(PropTypes.string),
		gridSizes: PropTypes.objectOf(
			PropTypes.oneOfType([
				PropTypes.exact({
					xs: PropTypes.number,
					sm: PropTypes.number,
					md: PropTypes.number,
					lg: PropTypes.number,
					xl: PropTypes.number
				}),
				PropTypes.object
			])
		),
		gridSpacing: PropTypes.number,
		label: PropTypes.oneOf([ 'above', 'none', 'placeholder' ]),
		name: PropTypes.string.isRequired,
		node: PropTypes.instanceOf(Parent).isRequired,
		onNodeChange: PropTypes.objectOf(PropTypes.func),
		onEnter: PropTypes.func,
		placeholder: PropTypes.string,
		returnAll: PropTypes.bool,
		root: PropTypes.bool,
		type: PropTypes.oneOf([ 'create', 'search', 'update' ]).isRequired,
		value: PropTypes.object,
		validation: PropTypes.bool
	}
	static defaultProps = {
		dynamicOptions: [ ],
		gridSizes: { __default__: { xs: 12 } },
		gridSpacing: 2,
		label: 'above',
		root: false,
		returnAll: false,
		value: {},
		validation: true
	}
	// Instance variables
	node: DefineBase | null;
	declare props: DefineParentProps;
	state: DefineParentState;
	fields: Record<string, DefineBase>;

	/**
	 * Constructor
	 *
	 * Creates a new instance
	 *
	 * @name DefineParent
	 * @access public
	 * @param props Properties passed to the component
	 * @returns a new instance
	 */
	constructor(props: DefineParentProps) {

		// Call parent
		super(props);

		// Init node ref
		this.node = null;

		// Init state
		this.state = this.generateState();

		// Init the field refs
		this.fields = {};
	}

	/**
	 * Component Did Update
	 *
	 * Called when any of the props to the component are changed
	 *
	 * @name componentDidUpdate
	 * @access public
	 * @param prevProps The previous properties of the component
	 */
	componentDidUpdate(prevProps: DefineParentProps) {

		// If the error changed
		if(prevProps.error !== this.props.error) {
			if(this.props.error) {
				this.error(this.props.error);
			}
		}

		// If the Node changed, or the overrides changed
		if(prevProps.node !== this.props.node ||
			prevProps.display !== this.props.display) {
			this.setState(this.generateState());
		}

		// If the value changed
		if(prevProps.value !== this.props.value) {

			// If we have a plugin component
			if(this.state.plugin) {
				(this.node as DefineBase).value = this.props.value;
				return;
			}

			// Set the values
			for(const k of Object.keys(this.props.value)) {
				if(k in this.fields) {
					this.fields[k].value = this.props.value[k];
				} else {
					// tslint:disable-next-line:no-console
					console.warn(`Field (${k}) not found`)
				}
			}
		}
	}

	/**
	 * Error
	 *
	 * Sets a new object of error messages by field
	 *
	 * @name error
	 * @access public
	 * @param errors Errors to set on the component
	 */
	error(errors: string[][] | Record<string, any>) {

		// Errors
		let oErrors: Record<string, any>;

		// If we got an array
		if(Array.isArray(errors)) {
			oErrors = errorTree(errors);
		} else {
			oErrors = errors;
		}

		// Go through each error
		for(const k of Object.keys(oErrors)) {
			if(k in this.fields) {
				this.fields[k].error(oErrors[k]);
			} else {
				throw new Error(`Field not found error: ${k} = ${oErrors[k]}`);
			}
		}
	}

	/**
	 * Generate State
	 *
	 * Uses the props and node data to generate the state to set
	 *
	 * @name generateState
	 * @access public
	 * @returns the new state to set
	 */
	generateState(): DefineParentState {

		// Get the React special section if there is one
		const oUI = this.props.node.special('ui') || { };

		// If there's overrides
		if(this.props.display) {
			merge(oUI, this.props.display);
		}

		// Init the state
		const oState: DefineParentState = {
			display: oUI,
			plugin: null,
			title: oUI.__title__ || false
		};

		// If we have a type
		if(oUI.__type__ && oUI.__type__ in _plugins) {

			// Set the plugin
			oState.plugin = _plugins[oUI.__type__];

		} else {

			// Init the list elements
			const lElements: JSX.Element[] = [ ];

			// Init the order
			let lOrder: string[] = [ ];

			// If we were passed specific fields
			if(this.props.fields) {
				lOrder = this.props.fields;
			}

			// Else, if we have the specific type in the react section
			else if(`__${this.props.type}__` in oUI) {
				lOrder = oUI[`__${this.props.type}__`];
			}

			// Else, if we have the generic 'order' in the react section
			else if('__order__' in oUI) {
				lOrder = oUI.__order__;
			}

			// Else, just use the keys of the node
			else {
				lOrder = this.props.node.keys();
			}

			// If we have any dynamic options
			let oDynOpts: Record<string, (key?: string) => void> | null = null;
			if(this.props.dynamicOptions && this.props.dynamicOptions.length) {

				// Set the var to an object
				oDynOpts = {};

				// Go through each one
				for(const o of this.props.dynamicOptions) {

					// If the node doesn't exist
					if(!this.props.node.get(o.node)) {
						throw new Error(
							`Node "${o.node}" used as a node in "dynamicOptions" attribute does not exist in the Parent`
						);
					}

					// If the trigger doesn't exist
					if(!this.props.node.get(o.trigger)) {
						throw new Error(
							`Node "${o.trigger}" used as a trigger in "dynamicOptions" attribute does not exist in the Parent`
						);
					}

					// Get the react section of the node
					const oNodeUI = this.props.node.get(o.node).special('ui') ||
									{ };

					// Create a OptionsHash using the options and the current
					//	value of the node, and store it under the node's options
					oNodeUI.__options__ = new OptionsHash(
						o.options,
						((this.props.value && this.props.value[o.trigger]) ||
							null)
					);

					// Overwrite the react special
					this.props.node.get(o.node).special('ui', oNodeUI);

					// Store the callback for the trigger
					oDynOpts[o.trigger] = oNodeUI.__options__.key.bind(
						oNodeUI.__options__
					);
				}
			}

			// Go through each node
			for(const sField of lOrder) {

				// Get the node
				const oChild = this.props.node.get(sField);

				// Get the class
				const sClass = oChild.class();

				// Get the value
				const mValue = (sField in this.props.value) ?
					this.props.value[sField] :
					null;

				// Display override
				const mDisplay = (this.props.display &&
									this.props.display[sField]) ||
									undefined;

				// If we have an array, hash, or parent
				if([ 'ArrayNode', 'HashNode', 'Parent' ].includes(sClass)) {

					// Calculate the different grid sizes
					let gridSizes: gridSizesStruct;

					// Init the base props
					const oProps: DefineBaseProps = {
						display: mDisplay,
						label: this.props.label,
						ref: (el: DefineBase) => this.fields[sField] = el,
						name: sField,
						node: oChild,
						onEnter: this.props.onEnter,
						returnAll: this.props.returnAll,
						type: this.props.type,
						value: mValue,
						validation: this.props.validation
					}

					// If we have the actual field name
					if(sField in this.props.gridSizes!) {

						// If we have a "self", pop it off, or use the default
						//	full width
						if('__self__' in this.props.gridSizes![sField]) {
							gridSizes = opop(this.props.gridSizes!, sField);
						} else {
							gridSizes = { xs: 12 }
						}

						// Set the child grid sizes from the remainder
						oProps.gridSizes = this.props.gridSizes![sField] as
							gridSizesByNodeStruct;
					}

					// Else, if we have a default on the grid sizes, set it as
					//	both the child and self
					else if('__default__' in this.props.gridSizes!) {
						gridSizes = this.props.gridSizes!.__default__;
						oProps.gridSizes = {
							__default__: this.props.gridSizes!.__default__
						}
					}

					// Else, set max width for everything
					else {
						gridSizes = { xs: 12 };
					}

					// Init the list of possible callbacks
					const oOnChange: Record<string, any> = { };

					// If we have a "node" level callback, add it to the list
					if(this.props.onNodeChange &&
						sField in this.props.onNodeChange) {
						oOnChange.node = this.props.onNodeChange[sField];
					}

					// If we have a parent level callback, add it as well
					if(this.props.onChange) {
						oOnChange.parent = this.props.onChange;
					}

					// If we have any onChange events
					if(!empty(oOnChange)) {
						oProps.onChange = (value: any, oldValue: any) => {

							// Generate the full parent value with the node
							//	that just changed
							const mNewValue = { ...this.value, [sField]: value }

							// If we are tracking the entire parent
							if(oOnChange.parent) {
								oOnChange.parent(
									mNewValue,
									this.props.value
								);
							}

							// If we are tracking a specific node changing
							if(oOnChange.node) {
								const m = oOnChange.node({
									data: mNewValue,
									node: sField,
									oldValue,
									value
								});
								if(m) {
									return this._nodeTriggeredChanges(
										sField, m
									);
								}
							}
						}
					}

					// Add the complex node to a grid item that's pushed to the
					//	list of elements to render
					lElements.push(
						<div
							key={sField}
							className={`grid-item ${sizesToClasses(gridSizes)}`}
						>
							{DefineBase.create(sClass, oProps)}
						</div>
					);
				}

				// Else, if we're a node
				else if(sClass === 'Node') {

					// Calculate the grid sizes
					let gridSizes: gridSizesStruct;

					// If we have the actual field name
					if(sField in this.props.gridSizes!) {
						gridSizes = this.props.gridSizes![sField];
					}

					// Else, if we have a default on the grid sizes
					else if('__default__' in this.props.gridSizes!) {
						gridSizes = this.props.gridSizes!.__default__;
					}

					// Else, set max width for everything
					else {
						gridSizes = { xs: 12 };
					}

					// Init the base props for the node
					const oProps: DefineNodeProps = {
						display: mDisplay,
						error: false,
						label: this.props.label,
						ref: (el: DefineBase) => this.fields[sField] = el,
						name: sField,
						node: oChild as Node,
						onEnter: this.props.onEnter,
						type: this.props.type,
						value: mValue,
						validation: this.props.validation
					}

					// Init the list of possible callbacks
					const oOnChange: Record<string, any> = { };

					// If we have a trigger, add it to the list of callbacks
					if(oDynOpts && sField in oDynOpts) {
						oOnChange.dynamic = oDynOpts[sField];
					}

					// If we have a node level callback, add it to the list
					if(this.props.onNodeChange &&
						sField in this.props.onNodeChange) {
						oOnChange.node = this.props.onNodeChange[sField];
					}

					// If we have a parent level callback, add it as well
					if(this.props.onChange) {
						oOnChange.parent = this.props.onChange;
					}

					// If we have any onChange events
					if(!empty(oOnChange)) {
						oProps.onChange = (value: any, oldValue: any) => {

							// If we have some sort of dynamic based on the
							//	dynamicOptions prop
							if(oOnChange.dynamic) {
								oOnChange.dynamic(value);
							}

							// If we are tracking either an individual node, or
							//	the parent as a whole
							if(oOnChange.node || oOnChange.parent) {

								// Generate the full parent value with the node
								//	that just changed
								const mNewValue = {
									...this.value,
									[sField]: value
								};
								if(oOnChange.parent) {
									oOnChange.parent(
										mNewValue,
										this.props.value
									);
								}
								if(oOnChange.node) {
									const m = oOnChange.node({
										data: mNewValue,
										node: sField,
										oldValue,
										value
									});
									if(m) {
										return this._nodeTriggeredChanges(
											sField, m
										);
									}
								}
							}
						}
					}

					// Create the new node element in a grid item and push it to
					//	the list of elements to render
					lElements.push(
						<div
							key={sField}
							className={`grid-item ${sizesToClasses(gridSizes)}`}
						>
							{DefineBase.create(sClass, oProps)}
						</div>
					);
				}

				// Unknown or unsupported node type
				else {
					throw new Error(
						`Invalid Node type in parent of child: ${sField}`
					);
				}
			}

			// Set the elements and order
			oState.elements = lElements;
			oState.order = lOrder;
		}

		// Return the new state
		return oState;
	}

	/**
	 * Node Triggered Changes
	 *
	 * Called when a node that is setup to track changes changes
	 *
	 * @name nodeTriggeredChanges
	 * @access private
	 * @param name The name of the node that changed
	 * @param value The new values from the callback
	 */
	_nodeTriggeredChanges(name: string, value: any) {

		// If we got anything back
		if(value) {

			// Init possible return
			let mReturn;

			// Go through each field and update the value
			for(const k in value) {
				if(k in this.fields) {
					if(k === name) {
						mReturn = value[k];
					} else {
						this.fields[k].value = value[k];
					}
				}
			}

			// Return
			return mReturn;
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

		// If we have a plugin component
		if(this.state.plugin) {

			// Store the name
			const ElName = this.state.plugin;

			// Combine the regular node props with any plugin props
			const oProps: DefineNodeBaseProps = {
				display: this.state.display,
				error: this.props.error,
				label: this.props.label,
				ref: (el: DefineBase) => this.node = el,
				name: this.props.name,
				node: this.props.node,
				onChange: this.props.onChange,
				onEnter: this.props.onEnter,
				placeholder: (this.props as DefineParentProps).placeholder,
				type: this.props.type,
				value: this.props.value,
				validation: this.props.validation
			};

			// Render plugin type
			return (
				<ElName {...oProps} />
			);
		}

		// Regular Parent
		return this.props.root ? (<>
			{this.state.title &&
				<label>{this.state.title}</label>
			}
			<div
				className={`grid spacing-${this.props.gridSpacing} node-parent parent-${this.props.name}`}
			>
				{this.state.elements}
			</div>
		</>) : (
			<div className="node-parent-child">
				{this.state.title &&
					<label>{this.state.title}</label>
				}
				<div
					className={`grid spacing-${this.props.gridSpacing} node-parent parent-${this.props.name}`}
				>
					{this.state.elements}
				</div>
			</div>
		);
	}

	/**
	 * Reset
	 *
	 * Calls reset on all the child components
	 *
	 * @name reset
	 * @access public
	 */
	reset(): void {

		// If we have a plugin component
		if(this.state.plugin) {
			return (this.node as DefineBase).reset();
		}

		// Reset each child
		for(const k of Object.keys(this.fields)) {
			this.fields[k].reset();
		}
	}

	/**
	 * Valid
	 *
	 * Called to verify if the current data is valid
	 *
	 * @name valid
	 * @public
	 * @returns true if the current values are valid
	 */
	valid(): boolean {

		// Valid?
		let bValid = true;

		// If we have a plugin component
		if(this.state.plugin) {
			bValid = (this.props as DefineParentProps).node.valid(
				(this.node as DefineBase).value
			);
			if(!bValid) {
				(this.node as DefineBase).error(
					(this.props as DefineParentProps).node.validationFailures
				);
			}
			return bValid;
		}

		// Go through each item and validate it
		for(const k of this.state.order as string[]) {

			// Get the node
			const oNode = this.props.node.get(k);

			// If we have a Node
			if(oNode.class() === 'Node') {

				// If the value is invalid
				if(!oNode.valid(this.fields[k].value)) {
					this.fields[k].error(oNode.validationFailures[0][1]);
					bValid = false;
				}
			}

			// Else, if we have a more complex type
			else {

				// If the Component is invalid
				if(!this.fields[k].valid()) {
					bValid = false;
				}
			}
		}

		// Return valid state
		return bValid;
	}

	/**
	 * Value (get)
	 *
	 * Returns the current value
	 *
	 * @name value
	 * @property
	 * @returns the current value
	 */
	get value(): Record<string, any> {

		// If we have a plugin component
		if(this.state.plugin) {
			return (this.node as DefineBase).value;
		}

		// Init the return value
		const oRet: Record<string, any> = {};

		// Go through all the fields used
		for(const k of Object.keys(this.fields)) {

			// Get the new value
			const newVal = this.fields[k].value;

			// If we're in update mode and the returnAll flag is not set
			if(this.props.type === 'update' && !this.props.returnAll) {

				// If the value is different
				if(!compare(this.props.value[k], newVal)) {
					oRet[k] = newVal;
				}
			}

			// Else we're in insert or search mode
			else {

				// If the value isn't null, add it
				if(!empty(newVal)) {
					oRet[k] = newVal;
				}
			}
		}

		// Return the values
		return oRet;
	}

	/**
	 * Value (set)
	 *
	 * Called to set the new value
	 *
	 * @name value
	 * @property
	 */
	set value(val: Record<string, any>) {

		// If we have a plugin component
		if(this.state.plugin) {
			(this.node as DefineBase).value = val;
			return;
		}

		// Set the values
		for(const k of Object.keys(val)) {
			this.fields[k].value = val[k];
		}
	}
}

// Register the component
DefineBase.register('Parent', DefineParent);
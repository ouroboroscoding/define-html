/**
 * Define Base
 *
 * Handles the base class for all other define components
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-02-14
 */

// Ouroboros modules
import { Base } from '@ouroboros/define';
import { isObject } from '@ouroboros/tools';

// NPM modules
import React from 'react';

// Types
import {
	labelOptions,
	onChangeCallback,
	onEnterPressedCallback,
	typeOptions,
	variantOptions } from './DefineNode';

export type DefineBaseProps = {
	display?: Record<string, any>,
	error?: any,
	gridSizes?: gridSizesPropStruct,
	gridSpacing?: number,
	label?: labelOptions,
	name: string,
	node: Base,
	onChange?: onChangeCallback,
	onEnterPressed?: onEnterPressedCallback,
	placeholder?: string,
	ref?: any,
	returnAll?: boolean,
	type: typeOptions,
	value?: any,
	validation?: boolean,
	variant: variantOptions
};
export type gridSizesRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type gridSizesStruct = {
	xs?: gridSizesRange,
	sm?: gridSizesRange,
	md?: gridSizesRange,
	lg?: gridSizesRange,
	xl?: gridSizesRange
}
export type gridSizesByNodeStruct = { [key: string]: gridSizesStruct }
export type gridSizesByParentStruct = { [key: string]: gridSizesByNodeStruct }
export type gridSizesPropStruct = gridSizesByNodeStruct | gridSizesByParentStruct

// Private variables
const _components: Record<string, typeof DefineBase> = {};

/**
 * Define Base
 *
 * Class all other Components extend
 *
 * @name DefineBase
 * @access public
 */
export default class DefineBase extends React.Component {

	/**
	 * Create
	 *
	 * Creates a new react element based on the given type name
	 *
	 * @name create
	 * @access public
	 * @static
	 * @param name The name of the child class type to create
	 * @returns
	 */
	static create(name: string, props: Record<string, any>): React.ReactElement {

		// If the name is invalid
		if(!(name in _components)) {
			throw new Error(`DefineBase.create: no component named "${name}"`);
		}

		// If we didn't get an object for props
		if(!isObject(props)) {
			throw new Error('DefineBase.create: props must be an object');
		}

		// If value is null, remove it
		if(props.value === null) {
			delete props.value;
		}

		// Get the component
		const Component = _components[name];

		// Return
		return (
			<Component {...props} />
		);
	}

	// Called to register a child class with the create method
	static register(name: string, component: typeof DefineBase): void {
		_components[name] = component;
	}

	// Constructor
	constructor(props: Record<string, any>) {
		super(props);
	}

	// Must implement error
	error(error: any): void {
		throw new Error('Must implement error when extending DefineBase');
	}

	// Must implement reset
	reset(): void {
		throw new Error('Must implement reset when extending DefineBase');
	}

	// Must implement valid
	valid(): boolean {
		throw new Error('Must implement valid when extending DefineBase');
	}

	// Must implement get value
	get value() {
		throw new Error('Must implement get value when extending DefineBase');
	}

	// Must implement set value
	set value(val: any) {
		throw new Error('Must implement set value when extending DefineBase');
	}
}

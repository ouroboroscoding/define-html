/**
 * Define Node Hidden
 *
 * Handles a single non-visible define element
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-02-17
 */

// NPM modules
import React from 'react';

// Local components
import DefineNodeBase from './Base';

/**
 * Node Hidden
 *
 * Handles values that aren't visible
 *
 * @name DefineNodeHidden
 * @access public
 * @extends DefineNodeBase
 */
export default class DefineNodeHidden extends DefineNodeBase {

	/**
	 * Render
	 *
	 * Generates the actual DOM elements of the component
	 *
	 * @name render
	 * @access public
	 */
	render() {
		return (
			<input
				className={`form-field field-${this.props.name} node-hidden`}
				type="hidden"
				value={this.state.value === null ? '' : this.state.value}
			/>
		);
	}
}

// Register with Node
DefineNodeBase.pluginAdd('hidden', DefineNodeHidden);
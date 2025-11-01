/**
 * Options Custom
 *
 * Allows base functionality of non static options with full access to modify
 * the data whenever the user sees fit
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding
 * @created 2023-02-15
 */

// Ouroboros modules
import Subscribe from '@ouroboros/subscribe';

/**
 * Custom
 *
 * Class to allow for dynamic data in selects/dropdowns set whenever the user
 * decides
 *
 * @name Custom
 * @access public
 * @extends Subscribe
 */
export default class Custom extends Subscribe {
	constructor() {
		super([]);
	}
}
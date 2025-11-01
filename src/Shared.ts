/**
 * Shared
 *
 * Methods for shared functionality in define components
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding
 * @created 2023-02-15
 */

/**
 * Error Tree
 *
 * Converts array of rest field errors into a tree
 *
 * @name errorTree
 * @access public
 * @param {string[][]} errors The list of errors
 * @returns {object}
 */
export function errorTree(errors: string[][]): Record<string, any> {

	// Init the return
	const oRet: Record<string, any> = {}

	// Go through each error
	for(const err of errors) {

		// If the error field has a period
		if(err[0].includes('.')) {

			// Split it
			const lField = err[0].split(/\.(.*)/)

			// If we don't have the field already
			if(!oRet[lField[0]]) {
				oRet[lField[0]] = []
			}

			// Add the rest
			oRet[lField[0]].push([lField[1], err[1]]);
		}

		// Else it's a flat field
		else {
			if(err[1] === 'is not a string') {
				err[1] = 'missing';
			}
			oRet[err[0]] = err[1];
		}
	}

	// Go through all the errors we found
	for(const k of Object.keys(oRet)) {

		// If we find an array
		if(Array.isArray(oRet[k])) {

			// Recurse
			oRet[k] = errorTree(oRet[k]);
		}
	}

	// Return the Tree
	return oRet;
}

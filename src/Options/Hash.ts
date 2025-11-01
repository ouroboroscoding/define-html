/**
 * Options Hash
 *
 * Dynamic options based on a single data point changing
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding
 * @created 2023-02-15
 */

// Ouroboros modules
import Subscribe from '@ouroboros/subscribe';

// Types
export type HashData = Record<string, string[][] | string[]>;
export type HashFunc = () => Promise<HashData>;
export type HashArg = HashData | HashFunc

/**
 * Hash
 *
 * Class to allow for dynamic data based on a hash of key to list of key, value
 * lists
 *
 * @name Hash
 * @access public
 * @extends Subscribe
 */
export default class Hash extends Subscribe {

	// Instance variables
	_hash: HashData;
	_key: string;

	/**
	 * Hash
	 *
	 * Constructor
	 *
	 * @name Hash
	 * @access public
	 * @param hash The key to key/value pairs, or a function that returns a
	 * 				promise
	 * @param initialKey Optional, the initial key to use,
	 * 						defaults to the first key in the hash
	 * @returns a new instance
	 */
	constructor(hash: HashArg, initialKey: string | null = null) {

		// Call base class constructor
		super([]);

		// Store the key
		this._key = initialKey || '';

		// If we got a function, call it and process the promise data
		if(typeof hash === 'function') {
			hash().then(data => {
				this.hash(data)
			}, error => {
				throw new Error(error)
			});
		}

		// Else, we got the data as is, store it and check if the key already
		//	fits
		else {
			this._hash = hash;
			if(this._key in this._hash) {
				this.set(this._hash[this._key]);
			}
		}
	}

	/**
	 * Hash
	 *
	 * Sets/Gets the hash data
	 *
	 * @name hash
	 * @access public
	 * @param hash Optional, used to set value, else get
	 * @returns the current hash, or void on setting new hash
	 */
	hash(hash: HashData): void | HashData {

		// If we got a hash
		if(hash !== undefined) {

			// Store the new hash
			this._hash = hash;

			// Set the data and notify subscribers
			this.set(this._key in this._hash ? this._hash[this._key] : [ ]);
		}

		// Else, return the current hash
		else {
			return this._hash;
		}
	}

	/**
	 * Key
	 *
	 * Sets/Gets the key
	 *
	 * @name key
	 * @access public
	 * @param key Optional, used to set value, else get
	 * @returns the current key, or void on setting new key
	 */
	key(key?: string): void | string {

		// If we got a key
		if(key !== undefined) {

			// Store the new key
			this._key = key;

			// Set the data and notify subscribers
			this.set(this._key in this._hash ? this._hash[this._key] : [ ]);
		}

		// Else, return the current key
		else {
			return this._key;
		}
	}
}
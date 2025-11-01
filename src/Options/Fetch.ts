/**
 * Options Fetch
 *
 * Dynamic options based on a data from a fetching call
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding
 * @created 2023-02-15
 */

// Ouroboros modules
import Subscribe, {
	SubscribeCallback, SubscribeReturn
} from '@ouroboros/subscribe';

// Import types
export type FetchType = () => Promise<Record<string, any>[]>;
export type FieldsType = (data: Record<string, any>) => string[];

/**
 * Fetch
 *
 * Class to allow for dynamic data in selects/dropdowns built from rest requests
 *
 * @name Fetch
 * @access public
 * @extends
 */
export default class Fetch extends Subscribe {

	// Instance variables
	_fetch: FetchType;
	_fetched: boolean;
	_fields: string[] | FieldsType;

	/**
	 * Fetch
	 *
	 * Creates an instance of the class with default data
	 *
	 * @name OptionsFetch
	 * @access public
	 * @param fetch The function called to return the data
	 * @param fields A list of [ key, value ], or a function
	 * 					that return [ key, value ] for the element passed
	 * 					to it
	 * @param data Default data
	 * @returns a new instance
	 */
	constructor(
		fetch: FetchType,
		fields: string[] | FieldsType = [ '_id', 'name' ],
		data: string[][] = []
	) {

		// Call the base class constructor
		super(data);

		// Store the fetch function
		this._fetch = fetch;
		this._fields = fields;

		// Init the data
		this._fetched = false;
	}

	/**
	 * Track
	 *
	 * Stores a callback function to be called whenever the data changes
	 *
	 * @name subscribe
	 * @access public
	 * @param callback The function to call when data changes
	 * @param remove Set to false to remove the callback
	 */
	subscribe(callback: SubscribeCallback): SubscribeReturn {

		// Call the base class subscribe
		const oReturn = super.subscribe(callback);

		// If we don't have the data yet
		if(!this._fetched) {
			this._fetched = true;

			// Call the instance's fetch
			this._fetch().then(data => {

				// Generate the name/value pairs
				const lData = [];
				for(const o of data) {
					if(typeof this._fields === 'function') {
						lData.push(this._fields(o));
					} else {
						lData.push([o[this._fields[0]], o[this._fields[1]]]);
					}
				}

				// Notify the subscribeers
				this.set(lData);
			});
		}

		// Return the current data and unsubscribe
		return oReturn;
	}
}
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Organization Model
 * ==========
 */

var Organization = new keystone.List('Organization');

Organization.add({
	name: { type: Types.Text, required: true, index: true }
});


/**
 * Registration
 */

Organization.defaultColumns = 'name';
Organization.register();

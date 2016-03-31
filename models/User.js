var keystone = require('keystone');
var Types = keystone.Field.Types;

var deps = {
    facebook: {
        'services.saml.isConfigured': true
    }
}

/**
 * User Model
 * ==========
 */

var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	password: { type: Types.Password, initial: true, required: true }
}, 'Services', {
    services: {
        saml: {
            isConfigured: {
                type: Boolean,
                label: 'SAML has been authenticated'
            },
            profileId: {
                type: String,
                label: 'Profile ID',
                dependsOn: deps.saml
            },
            username: {
                type: String,
                label: 'SAML Username',
                dependsOn: deps.saml
            },
            avatar: {
                type: String,
                label: 'Image',
                dependsOn: deps.saml
            },
            accessToken: {
                type: String,
                label: 'Access Token',
                dependsOn: deps.saml
            },
            refreshToken: {
                type: String,
                label: 'Refresh Token',
                dependsOn: deps.saml
            }
        }
    }
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true }
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
	return this.isAdmin;
});


/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin';
User.register();

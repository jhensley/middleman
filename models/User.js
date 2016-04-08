var keystone = require('keystone');
var Types = keystone.Field.Types;

var deps = {
    saml: {
        'services.saml.isConfigured': true
    },
    github: {
        'services.github.isConfigured': true
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
            }
        },
        github: {
            isConfigured: {
                type: Boolean,
                label: 'GitHub has been authenticated'
            },
            profileId: {
                type: String,
                label: 'Profile ID',
                dependsOn: deps.github  
            },
            accessToken: {
                type: String,
                label: 'Access Token',
                dependsOn: deps.github
            },
            refreshToken: {
                type: String,
                label: 'Refresh Token',
                dependsOn: deps.github
            },
            username: {
                type: String,
                label: 'GitHub username',
                dependsOn: deps.github
            },
            safe: {
                type: Boolean,
                default: false,
                label: 'Safe Account (Do not enforce 2FA)',
                dependsOn: deps.github
            }
        },
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

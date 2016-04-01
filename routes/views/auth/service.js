var _ = require('lodash'),
    services = {
        saml: require('../../../lib/auth/saml'),
        github: require('../../../lib/auth/github')
    };

exports = module.exports = function(req, res, next) {
    if (req.query.target) {
        res.cookie('target', req.query.target);
    }

    if (req.query.deauthorize && req.user) {
        _.assign(req.user.services[req.params.service], {
            isConfigured: undefined,
            accessToken: undefined,
            refreshToken: undefined,
            dc: undefined,
            apiEndpoint: undefined,
            profileId: undefined,
            username: undefined
        });
        req.user.save(function() {
            if (req.query.target) res.redirect(req.query.target);
            else res.redirect('/');
        });
    } else {
        services[req.params.service].authenticateUser(req, res, next);
    }
};
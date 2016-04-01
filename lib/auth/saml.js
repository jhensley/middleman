var async = require('async'),
    fs = require('fs'),
    _ = require('lodash');

var passport = require('passport'),
    SamlStrategy = require('passport-saml').Strategy;

var credentials = {
    entryPoint: process.env.SAML_ENTRY_POINT,
    logoutUrl: process.env.SAML_LOGOUT_URL,
    cert: fs.readFileSync(process.env.SAML_CERT, 'utf-8'),
    privateCert: fs.readFileSync(process.env.SAML_PRIVATE_CERT, 'utf-8'),
    issuer: process.env.SAML_ISSUER,
    callbackUrl: process.env.SAML_CALLBACK_URL,
    identifierFormat: null
};

exports.authenticateUser = function(req, res, next) {
    // Initalize SAML credentials
    var samlStrategy = new SamlStrategy(credentials, function(profile, done) {
        done(null, {
            profile: profile
        });
    });
    // Pass through authentication to passport
    passport.use(samlStrategy);
    // Save user data once returning from SAML
    if (_.has(req.params, 'cb') || _.has(req.query, 'cb')) {
        passport.authenticate('saml', function(err, data, info) {
            if (err || !data) {
                return res.redirect('/');
            }
            console.log(data);
            var auth = {
                type: 'saml',
                name: {
                    first: data.profile.givenName,
                    last: data.profile.surname
                },
                email: data.profile.emailAddress
            };
            req.session.auth = auth;
            return res.redirect('/auth/confirm');
        })(req, res, next);
    } else {
        passport.authenticate('saml')(req, res, next);
    }
};
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
    identifierFormat: process.env.SAML_IDENTIFIER_FORMAT
};

exports.authenticateUser = function(req, res, next) {
    // Initalize MailChimp credentials
    var samlStrategy = new SamlStrategy(credentials, function(accessToken, refreshToken, profile, done) {
        done(null, {
            accessToken: accessToken,
            refreshToken: refreshToken,
            profile: profile
        });
    });
    // Pass through authentication to passport
    passport.use(samlStrategy);
    // Save user data once returning from ConstantContact
    if (_.has(req.params, 'cb') || _.has(req.query, 'cb')) {
        passport.authenticate('saml', function(err, data, info) {
            if (err || !data) {
                return res.redirect('/signin');
            }
            console.log(data);
            var auth = {
                type: 'saml',
                accessToken: data.accessToken,
                username: data.profile._json.user_name
            };
            req.session.auth = auth;
            return res.redirect('/auth/confirm');
        })(req, res, next);
    } else {
        passport.authenticate('saml')(req, res, next);
    }
};
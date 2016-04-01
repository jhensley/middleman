var async = require('async'),
    _ = require('lodash');

var passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy;

var credentials = {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['user'],
    userAgent: 'Octocat'
};

exports.authenticateUser = function(req, res, next) {
    // Initalize GitHub credentials
    var ghStrategy = new GitHubStrategy(credentials, function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        done(null, {
            accessToken: accessToken,
            refreshToken: refreshToken,
            profile: profile
        });
    });
    // Pass through authentication to passport
    passport.use(ghStrategy);
    // Save user data once returning from GitHub
    if (_.has(req.query, 'cb')) {
        passport.authenticate('github', function(err, data, info) {
            if (err || !data) {
                return res.redirect('/signin');
            }
            var name = data.profile && data.profile.displayName ? data.profile.displayName.split(' ') : [];
            var auth = {
                type: 'github',
                name: {
					first: name.length ? name[0] : '',
					last: name.length > 1 ? name[1] : ''
				},
                profileId: data.profile.id,
                accessToken: data.accessToken,
				refreshToken: data.refreshToken,
                username: data.profile.username
            };
            req.session.auth = auth;
            return res.redirect('/auth/confirm');
        })(req, res, next);
    } else {
        passport.authenticate('github')(req, res, next);
    }
};

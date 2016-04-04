var keystone = require('keystone'),
    async = require('async'),
    _ = require('lodash'),
    User = keystone.list('User');

exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res),
        locals = res.locals;

    locals.section = 'profile';
    locals.form = req.body;
    locals.returnto = req.query.returnto;

    locals.authUser = req.session.auth;
    if (locals.authUser) {
        locals.authUser.market = req.session.market;
    }
    locals.existingUser = false;

    // Reject request if no auth data is stored in session
    if (!locals.authUser) {
        return res.redirect('/');
    }

    // Set existing user if already logged in
    if (req.user) {
        locals.existingUser = req.user;
    }

    // Function to handle signin
    var doSignIn = function() {
        var onSuccess = function(user) {
            return res.redirect(req.cookies.target || '/');
        };

        var onFail = function() {
            req.flash('error', 'Our apologies, there was a problem on our side with signing you in. Please try again.');
            return res.redirect('/auth/saml');
        };
        keystone.session.signin(String(locals.existingUser._id), req, res, onSuccess, onFail);
    };

    // Function to check if a user already exists for this profile id (and sign them in)
    var checkExisting = function(next) {
        if (locals.existingUser) return checkAuth();

        var query = User.model.findOne();
        if (locals.authUser.type === 'saml') {
            query.where('email', locals.authUser.email);    
        } else {
            query.where('services.' + locals.authUser.type + '.profileId', locals.authUser.profileId);
        }
        query.exec(function(err, user) {
            if (err) {
                return next({
                    message: 'Our apologies, there was a problem on our side with processing your information. Please try again.'
                });
            };
            if (user) {
                locals.existingUser = user;
                return doSignIn();
            }
            return next();
        });
    };

    // Function to handle data confirmation process
    var checkAuth = function() {
        async.series([
            // Check for user by email (only if not signed in)
            function(next) {
                if (locals.existingUser) return next();
                var query = User.model.findOne();
                query.where('email', locals.form.email);
                query.exec(function(err, user) {
                    if (err) {
                        return next({
                            message: 'Our apologies, there was a problem on our side with processing your information. Please try again.'
                        });
                    }
                    if (user) {
                        return next({
                            message: 'Doppelganger alert: A user already exists with that email address. Try signing in.'
                        });
                    }
                    return next();
                });
            },
            // Check for existing github user
            function(next) {
                var query = User.model.findOne();
                query.where('services.' + locals.authUser.type + '.profileId', locals.authUser.profileId);
                query.exec(function(err, user) {
                    if (err) {
                        return next({
                            message: 'Our apologies, there was a problem on our side with processing your information. Please try again.'
                        });
                    };
                    if (user) {
                        return next({
                            message: 'Oops, looks like someone has already authenticated with that Github account'
                        });
                    }
                    return next();
                });
            },
            // Create or update user
            function(next) {
                var userData;
                if (locals.existingUser) {

                    userData = {
                        state: 'enabled',
                        isVerified: true,
                        services: locals.existingUser.services
                    };
                    _.extend(userData.services[locals.authUser.type], {
                        isConfigured: true,
                        profileId: locals.authUser.profileId,
                        username: locals.authUser.username,
                        avatar: locals.authUser.avatar,
                        accessToken: locals.authUser.accessToken,
                        accessTokenSecret: locals.authUser.accessTokenSecret,
                        realmId: locals.authUser.realmId,
                        refreshToken: locals.authUser.refreshToken,
                        dc: locals.authUser.dc,
                        apiEndpoint: locals.authUser.apiEndpoint
                    });
                    locals.existingUser.set(userData);
                    locals.existingUser.save(function(err) {
                        if (err) {
                            return next({
                                message: 'Our apologies, there was a problem on our side with processing your information. Please try again.'
                            });
                        }
                        return next();
                    });
                } else {
                    userData = {
                        name: {
                            first: locals.form['name.first'],
                            last: locals.form['name.last']
                        },
                        market: req.session.market,
                        email: locals.form.email,
                        password: Math.random().toString(36).slice(-8),
                        state: 'enabled',
                        isVerified: true,
                        services: {}
                    };
                    userData.services[locals.authUser.type] = {
                        isConfigured: true,
                        profileId: locals.authUser.profileId,
                        username: locals.authUser.username,
                        avatar: locals.authUser.avatar,
                        accessToken: locals.authUser.accessToken,
                        accessTokenSecret: locals.authUser.accessTokenSecret,
                        realmId: locals.authUser.realmId,
                        refreshToken: locals.authUser.refreshToken
                    };
                    locals.existingUser = new User.model(userData);
                    locals.existingUser.save(function(err, user) {
                        if (err) {
                            return next({
                                message: 'Our apologies, there was a problem on our side with processing your information. Please try again.'
                            });
                        }

                        return next();
                    });
                }
            },
            // Session
            function() {
                if (req.user) {
                    return res.redirect(req.cookies.target || '/');
                }
                return doSignIn();
            }
        ], function(err) {
            req.flash('error', err.message);
            return res.redirect('/');
        });
    };
    view.on('init', function(next) {
        return checkExisting(next);
    });

    view.on('post', {
        action: 'confirm.details'
    }, function(next) {
        if (!locals.form['name.first'] || !locals.form['name.last'] || !locals.form.email) {
            req.flash('error', 'Please enter a name & email.');
            return next();
        }
        return checkAuth();
    });

    view.render('auth/confirm');
};


var keystone = require('keystone'),
    Users = keystone.list('User'),
    github = require('../../../utils/github'),
    async = require('async'),
    config = require('config'),
    _ = require('lodash');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'members/' + req.params.org;
    locals.org = _(config.get('github.organizations')).filter(function(org) {
        return org.name === req.params.org;
    }).first();
    locals.members = [];
    
    view.on('init', function(next) {
        async.waterfall([
            function(next) {
                github.getOrganizationMembers(req.params.org, function(err, members) {
                    if (err) {
                        return next(err);
                    };
                    return next(null, members);
                })
            },
            function(members, next) {
                var query = Users.model.find();
                query.where('services.github.username', {
                    $in: members
                });
                query.exec(function(err, data) {
                    if (err) {
                        return next();
                    }
                    var localGithubAccounts = _.reduce(data, function(memo, iter) {
                        memo.push(iter.services.github.username);
                        return memo;
                    }, []);
                    locals.notInSystem = _.filter(members, function(member) {
                        return localGithubAccounts.indexOf(member) < 0;
                    });
                    locals.members = data;
                    next();
                });
            },
            function(next) {
                if (locals.org.enforce2FA) {
                    github.getOrganizationMembers(req.params.org, true, function(err, members2FADisabled) {
                        if (err) {
                            return next(err);
                        };
                        locals.members = _.forEach(locals.members, function(member) {
                            member.has2FA = members2FADisabled.indexOf(member.services.github.username) < 0;
                        });
                        locals.membersWithout2FA = _.filter(locals.members, function(member) {
                            return member.has2FA === false; 
                        });
                        console.log(locals.membersWithout2FA);
                        next();
                    })
                } else {
                    next();
                }
            }
        ], function(err) {
            next();
        })
    });
	
	// Render the view
	view.render('admin/members');
	
};
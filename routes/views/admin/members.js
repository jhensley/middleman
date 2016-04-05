var keystone = require('keystone'),
    Users = keystone.list('User'),
    github = require('../../../utils/github'),
    async = require('async'),
    _ = require('lodash');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'members/' + req.params.org;
    locals.org = req.params.org;
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
                    console.log(locals.notInSystem);
                    locals.members = data;
                    next();
                });
            }
        ], function(err) {
            next();
        })
    });
	
	// Render the view
	view.render('admin/members');
	
};
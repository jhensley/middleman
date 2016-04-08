var keystone = require('keystone'),
    github = require('../../../utils/github'),
    async = require('async');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'members/' + req.params.org;
    locals.org = req.params.org;
    
    view.on('post', function(next) {
        var count = 0;
        async.each(req.body.members.split(','), function(member, done) {
            github.removeUserFromOrganizationViaAdmin(member, req.params.org, function(err, data) {
                if (err) {
                    locals.error = err;
                    return done(err);
                }
                count++;
                return done();
            });
        }, function(err) {
            locals.count = count;
            if (err) {
                req.flash('error', 'Error removing users.');
            } else {
                req.flash('success', count + ' member(s) removed from ' + req.params.org);
            }
            next();
        });
    });
	
	// Redirect the view
	view.render('admin/batchRemove');
	
};
var keystone = require('keystone'),
    github = require('../../../utils/github');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'join';
    
    view.on('init', function(next) {
        github.addUserToOrganization(req.user, req.params.org, function(err, data) {
            if (err) {
                locals.error = err;
            }
            next();
        });
    });
	
	// Render the view
	view.render('join');
	
};
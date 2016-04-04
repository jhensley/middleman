var keystone = require('keystone'),
    github = require('../../../utils/github');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'join';
    locals.org = req.params.org;
    
    view.on('init', function(next) {
        github.removeUserFromOrganization(req.user, req.params.org, function(err, data) {
            if (err) {
                locals.error = err;
            }
            next();
        });
    });
	
	// Render the view
	view.render('leave');
	
};
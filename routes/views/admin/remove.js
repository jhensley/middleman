var keystone = require('keystone'),
    github = require('../../../utils/github');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'members/' + req.params.org;
    locals.org = req.params.org;
    locals.ghUser = req.params.ghUser;
    
    view.on('init', function(next) {
        github.removeUserFromOrganizationViaAdmin(req.params.ghUser, req.params.org, function(err, data) {
            if (err) {
                locals.error = err;
            }
            next();
        });
    });
	
	// Render the view
	view.render('admin/remove');
	
};
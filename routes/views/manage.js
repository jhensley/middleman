var keystone = require('keystone'),
    github = require('../../utils/github');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'manage';
    
    view.on('init', function(next) {
        github.getCommonOrganizationMembershipByUsername(req.user, function(err, data) {
            if (!err) {
                locals.orgs = data;
                console.log(data);
            }
            next();
        });
    });
	
	// Render the view
	view.render('manage');
	
};
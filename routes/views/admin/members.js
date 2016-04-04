var keystone = require('keystone'),
    Users = keystone.list('User');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'members/' + req.params.org;
    locals.org = req.params.org;
    
    view.on('init', function(next) {
        var query = Users.model.find();
        query.where('services.github.username', {
            $in: [
                'jhensley'
            ]
        });
        query.exec(function(err, data) {
            if (err) {
                return next();
            }
            locals.members = data;
            next();
        })
    });
	
	// Render the view
	view.render('members');
	
};
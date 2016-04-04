/**
 * This file is where you define your application routes and controllers.
 * 
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 * 
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 * 
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 * 
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 * 
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views')
};

// Setup Route Bindings
exports = module.exports = function(app) {
	
    // Auth
    app.all('/auth/confirm', routes.views.auth.confirm);
    app.all('/auth/:service', routes.views.auth.service);
    app.all('/auth/:service/:cb', routes.views.auth.service);
    
	// Views
	app.get('/', middleware.requireUser, routes.views.index);
    app.get('/manage/:username', middleware.requireUser, middleware.requireGithubAuthentication, routes.views.manage);
    app.get('/join/:org', middleware.requireUser, middleware.requireGithubAuthentication, routes.views.org.join);
    app.get('/leave/:org', middleware.requireUser, middleware.requireGithubAuthentication, routes.views.org.leave);
    app.get('/members/:org', middleware.requireAdminUser, routes.views.admin.members);
    app.get('/remove/:org/:ghUser', middleware.requireAdminUser, routes.views.admin.remove);
	
};

var GitHubApi = require('github4')

var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    pathPrefix: "", // for some GHEs; none for GitHub
    timeout: 5000,
    headers: {
        "user-agent": "Middleman" // GitHub is happy with a unique user agent
    }
});

exports.getCommonOrganizationMembershipByUsername = function(user, cb) {
    github.authenticate({
        type: 'oauth',
        token: user.services.github.accessToken
    })
    github.user.getOrgs({
        user: user.services.github.username
    }, function(err, data) {
        // TODO: Map Config Orgs to user orgs - return object w/ boolean flags
        cb(err, data);
    })
}

exports.removeUserFromOrganization = function(user, org, cb) {
    github.authenticate({
        type: 'oauth',
        token: process.env.GITHUB_ADMIN_TOKEN
    });
    github.orgs.removeMember({
        user: User.services.github.username,
        org: org
    }, function(err, data) {
        cb(err, data);
    })
}

exports.addUserToOrganization = function(user, org, cb) {
    github.authenticate({
        type: 'oauth',
        token: process.env.GITHUB_ADMIN_TOKEN
    });
    github.orgs.addOrganizationMembership({
        user: User.services.github.username,
        org: org
    }, function(err, data) {
        cb(err, data);
    })
}
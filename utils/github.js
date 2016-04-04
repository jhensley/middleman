var GitHubApi = require('github'),
    config = require('config'),
    _ = require('lodash');

var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: false,
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
    });
    github.user.getOrgs({
        user: user.services.github.username
    }, function(err, data) {
        // TODO: Map Config Orgs to user orgs - return object w/ boolean flags
        var flatUserOrgs = _.reduce(data, function(memo, iter) {
            memo.push(iter.login);
            return memo;
        }, []);
        var mappedOrgs = _.map(config.get('github.organizations'), function(org) {
            var out = {};
            if (flatUserOrgs.indexOf(org.name) >= 0) {
                out.active = true;
            }
            out.name = org.name;
            return out;
        });
        cb(err, mappedOrgs);
    })
}

exports.removeUserFromOrganization = function(user, org, cb) {
    github.authenticate({
        type: 'oauth',
        token: process.env.GITHUB_ADMIN_TOKEN
    });
    github.orgs.removeMember({
        user: user.services.github.username,
        org: org
    }, function(err, data) {
        cb(err, data);
    })
}

exports.removeUserFromOrganizationViaAdmin = function(user, org, cb) {
    github.authenticate({
        type: 'oauth',
        token: process.env.GITHUB_ADMIN_TOKEN
    });
    github.orgs.removeMember({
        user: user,
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
        user: user.services.github.username,
        org: org
    }, function(err, data) {
        cb(err, data);
    })
}

function _recursePagination(client, data, members, cb) {
    if (client.hasNextPage(data.meta.link)) {
        client.getNextPage(data.meta.link, function(err, page) {
            var both = members.concat(page);
            return _recursePagination(client, page, both, cb);   
        });   
    } else {
        cb(null, members);
    };
}

exports.getOrganizationMembers = function(org, cb) {
    github.authenticate({
        type: 'oauth',
        token: process.env.GITHUB_ADMIN_TOKEN
    });
    github.orgs.getMembers({
        org: org,
        per_page: 100
    }, function(err, data) {
        _recursePagination(github, data, data, function(err, members) {
            var reduced = _.reduce(members, function(memo, iter) {
                memo.push(iter.login);
                return memo;
            }, []);
            cb(err, reduced); 
        });
    })
};

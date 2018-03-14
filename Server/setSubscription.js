const https = require('https');
const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    // Add subscription to database
    let user_name = event.user_name;
    let org_name = event.org_name;
    let is_fork = event.isFork;
    let is_member = event.isMember;
    let is_membership = event.isMembership;
    let is_organization = event.isOrganization;
    let is_public = event.isPublic;
    let is_push = event.isPush;
    let is_repository = event.isRepository;
    let is_releases = event.isReleases;
    let is_team = event.isTeam;

    let params = {
        TableName: 'Subscriptions',
        Item: {
            Username: user_name,
            Organization: org_name,
            isFork: is_fork,
            isMember: is_member,
            isMembership: is_membership,
            isOrganization: is_organization,
            isPublic: is_public,
            isPush: is_push,
            isRepository: is_repository,
            isReleases: is_releases,
            isTeam: is_team
        }
    };

    DynamoDB.put(params, function(err, data) {
        if (err) return callback(null, {message: err});

        return callback(null, {
            'message': 'Subscription settings saved successfully.'
        });
    });
};
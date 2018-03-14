const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    let params2 = event['pathParameters'].proxy.split('/');
    let organization = params2[0];
    let username = params2[1];

    let params = {
        TableName: 'Subscriptions',
        Key: {Username: username, Organization: organization}
    };

    DynamoDB.get(params, function(err, data) {
        if (err) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Something went wrong.',
                    err: err
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        let subscription = data.Item || {};

        DynamoDB.scan({TableName: 'Events'}, function(err, data) {
            if (err) {
                return callback(null, {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'Something went wrong.',
                        error: err
                    }),
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }

            let events = data.Items || [];
            events = events.filter(event => event.organization === organization);
            events = events.filter(event => {
                if (event.type === 'fork' && subscription.isFork) return event;
                if (event.type === 'member' && subscription.isMember) return event;
                if (event.type === 'membership' && subscription.isMembership) return event;
                if (event.type === 'organization' && subscription.isOrganization) return event;
                if (event.type === 'public' && subscription.isPublic) return event;
                if (event.type === 'push' && subscription.isPush) return event;
                if (event.type === 'repository' && subscription.isRepository) return event;
                if (event.type === 'release' && subscription.isReleases) return event;
                if (event.type === 'team' && subscription.isTeam) return event;
            });

            callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Events :)',
                    events: events
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
        });
    })
};

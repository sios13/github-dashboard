const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    let params2 = event['pathParameters'].proxy.split('/');

    let username = params2[0];
    let organization = params2[1];
    let settings = JSON.parse(event.body) || {};

    let params = {
        TableName: 'Activity',
        Key: {username: username, organization: organization}
    };
    DynamoDB.get(params, function(err, data) {
        if (err) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Could not find the activity.',
                    error: err
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        if (data.Item == undefined || data.Item == null) data.Item = {username: username, organization: organization};
        // if (settings == undefined || settings == null) settings = {};
        let activity = {};
        Object.assign(activity, data.Item, settings);
        let params2 = {
            TableName: 'Activity',
            Item: activity
        };
        DynamoDB.put(params2, function(err, data) {
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

            callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Activity successfully updated.',
                    subscription: data
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
        });
    });
};

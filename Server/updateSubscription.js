const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    let params2 = event['pathParameters'].proxy.split('/');

    let username = params2[0];
    let organization = params2[1];
    let settings = JSON.parse(event.body) || {};
    
    let params = {
        TableName: 'Subscriptions',
        Key: {Username: username, Organization: organization}
    };
    DynamoDB.get(params, function(err, data) {
        if (err) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    message: err
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        if (data.Item == undefined || data.Item == null) data.Item = {Username: username, Organization: organization};
        // if (settings == undefined || settings == null) settings = {};
        let subscription = {};
        Object.assign(subscription, data.Item, settings);
        let params2 = {
            TableName: 'Subscriptions',
            Item: subscription
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
                    message: 'Subscription successfully updated.',
                    subscription: data
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
        });
    });
};

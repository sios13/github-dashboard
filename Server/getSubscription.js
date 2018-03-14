const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    let params2 = event['pathParameters'].proxy.split('/');
    let username = params2[0];
    let organization = params2[1];

    let params = {
        TableName: 'Subscriptions',
        Key: {
            Username: username,
            Organization: organization
        }
    };
    
    DynamoDB.get(params, function(err, data) {
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
                message: 'Subscription successfully retrieved.',
                subscription: data.Item
            }),
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    });
};
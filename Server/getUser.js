const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    let params2 = event['pathParameters'].proxy.split('/');
    let username = params2[0];

    let params = {
        TableName: 'Users',
        Key: {username: username}
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
            })
        }

        callback(null, {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Hello from Lambda',
                user: data.Item
            }),
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    });
};

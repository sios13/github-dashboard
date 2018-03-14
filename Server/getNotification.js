const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();
const querystring = require('querystring');

exports.handler = (event, context, callback) => {
    let params2 = event['pathParameters'].proxy.split('/');
    let user_name = params2[0];
    let org_name = params2[1];
    
    let params = {
        TableName: 'Notifications',
        Key: {
            username: user_name,
            organization: org_name
        }
    };

    DynamoDB.get(params, function(err, data) {
        if (err) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    message: err,
                    user_name: user_name,
                    org_name: org_name
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
                data: data
            }),
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    });
};

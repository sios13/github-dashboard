const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();
const querystring = require('querystring');

exports.handler = (event, context, callback) => {
    let params2 = event['pathParameters'].proxy.split('/');
    let user_name = params2[0];
    let org_name = params2[1];

    let test = Object.assign({
            username: user_name,
            organization: org_name
        }, JSON.parse(event.body));
    
    let params = {
        TableName: 'Notifications',
        Item: test
    };

    DynamoDB.put(params, function(err, data) {
        if (err) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    message: err,
                    test
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
                test,
                event: event
            }),
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    });
};

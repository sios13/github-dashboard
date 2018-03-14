const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    let params2 = event['pathParameters'].proxy.split('/');

    let username = params2[0];
    let settings = JSON.parse(event.body);
    // let user = Object.assign({username: username}, settings);
    
    // let params = {
    //     TableName: 'Users',
    //     Key: {username: username},
    //     UpdateExpression: 'set email = :e',
    //     ExpressionAttributeValues: {
    //         ':e': 'hej'
    //     }
    // };
    
    let params = {
        TableName: 'Users',
        Key: {username: username}
    }
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

        let user = {};
        Object.assign(user, data.Item, settings);
        let params2 = {
            TableName: 'Users',
            Item: user
        }
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
                    message: 'User successfully updated.',
                    settings
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
        });
    });

    // DynamoDB.update(params, function(err, data) {
    //     if (err) {
    //         return callback(null, {
    //             statusCode: 200,
    //             body: JSON.stringify({
    //                 message: err,
    //                 user
    //             }),
    //             headers: {
    //                 'Access-Control-Allow-Origin': '*'
    //             }
    //         })
    //     }

    //     callback(null, {
    //         statusCode: 200,
    //         body: JSON.stringify({
    //             message: 'Hello from Lambda',
    //             settings
    //         }),
    //         headers: {
    //             'Access-Control-Allow-Origin': '*'
    //         }
    //     });
    // });
};

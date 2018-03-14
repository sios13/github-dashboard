const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    // 

    let user = JSON.parse(event.body);

    // return callback(null, {
    //     statusCode: 200,
    //     body: JSON.stringify({
    //         message: 'Hello from Lambda',
    //         params2
    //     }),
    //     headers: {
    //         'Access-Control-Allow-Origin': '*'
    //     }
    // });

    let params = {
        TableName: 'Users',
        Item: {
            username: user.username,
            img_url: user.img_url,
            email: user.email
        }
    };

    DynamoDB.put(params, function(err, data) {
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
                user
            }),
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    });
};

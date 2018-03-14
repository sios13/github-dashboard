const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    let params = event['pathParameters'].proxy.split('/');
    let username = params[0];
    let organization = params[1];

    DynamoDB.scan({TableName: 'Activity'}, function(err, data) {
        if (err) {
            callback(null, {
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

        let activity = data.Items;
        activity = activity.filter(act => act.username === username && act.organization === organization);

        callback(null, {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Activity :)',
                activity: activity
            }),
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    });
};

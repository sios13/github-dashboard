const https = require('https');

exports.handler = (event, context, callback) => {
    let code = JSON.parse(event.body).code;
    // let code = 123123123;
    let client_id = '460281c3aceac1aed9cd';
    let client_secret = 'secret :)';
    
    let postData = JSON.stringify({
        code: code,
        client_id: client_id,
        client_secret: client_secret
    });

    let options = {
        hostname: 'github.com',
        port: 443,
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Content-Length': postData.length
         }
    };

    let body = '';

    let req = https.request(options, function(response) {
        response.on('data', function(data) {
             body += data;
        });

        response.on('end', function() {
        
            // use code and attach client_id and client_secret
            callback(null, {
                "statusCode": 200,
                "headers": {
                    "my_header": "my_value",
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
                },
                "body": JSON.stringify({
                    message: body
                }),
                "isBase64Encoded": false
            });
        });
    });
    
    req.write(postData);
    req.end();
};

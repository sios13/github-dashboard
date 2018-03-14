const https = require('https');

exports.handler = (event, context, callback) => {
    // Add webhook to organization in github
    let user_name = event.user_name;
    let org_name = event.org_name;
    let access_token = event.access_token;

    let base_url = 'https://cnpqmk9lhh.execute-api.eu-central-1.amazonaws.com/prod';

    let postdata = JSON.stringify({
        'name': 'web',
        'active': true,
        'events': '*',
        'config': {
            'url': base_url + '/webhook',
            'content_type': 'json'
        }
    });

    let options = {
        hostname: 'api.github.com',
        port: 443,
        path: '/orgs/' + org_name + '/hooks',
        method: 'POST',
        headers: {
            'User-Agent': 'test',
            'Authorization': 'token ' + access_token
        }
    };

    let body = '';

    let req = https.request(options, function(response) {
        response.on('data', function(data) {
             body += data;
        });

        response.on('end', function() {
            callback(null, {
                'statusCode': response.statusCode,
                'body': JSON.parse(body),
                'isBase64Encoded': false
            }); 
        });
    });

    req.write(postdata);
    req.end();
};
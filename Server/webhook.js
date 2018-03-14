const https = require('http');
const querystring = require('querystring');
const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES({
   region: 'eu-west-1'
});

exports.handler = (event, context, callback) => {
    let organization = event.body.organization.login;
    let eventType = event.headers['X-GitHub-Event'];
    let id = event.headers['X-GitHub-Delivery'];

    // Save webhook to db
    let eventBodyStr = JSON.stringify(event.body);
    let date = new Date();
    let params3 = {
        TableName: 'Events',
        Item: {
            id: id,
            organization: organization,
            type: eventType,
            body: eventBodyStr,
            time: date.getTime()
        }
    };
    DynamoDB.put(params3, function(err) {});

    // 
    let params = {'TableName': 'Subscriptions'};
    DynamoDB.scan(params, function(err, data) {
        if (err) return callback(null, {message: err});

        let subscriptions = data.Items.filter(sub => sub.Organization === organization) || [];
        subscriptions = subscriptions.filter(function(sub) {
            if (sub.isFork && eventType === 'fork') return sub;
            if (sub.isMember && eventType === 'member') return sub;
            if (sub.isMembership && eventType === 'membership') return sub;
            if (sub.isOrganization && eventType === 'organization') return sub;
            if (sub.isPublic && eventType === 'public') return sub;
            if (sub.isPush && eventType === 'push') return sub;
            if (sub.isRepository && eventType === 'repository') return sub;
            if (sub.isReleases && eventType === 'release') return sub;
            if (sub.isTeam && eventType === 'team') return sub;
        });

        if (subscriptions.length == 0) return callback(null, {message: 'No notifications will be sent for this hook.'});

        let usersWhoAreSubscribed = subscriptions.map(sub => sub.Username);

        // Send email to users who have email notifications
        let params = {TableName: 'Notifications'};
        DynamoDB.scan(params, (err, data) => {
            if (err) return;
            
            let notifications = data.Items;
            let usersWhoWantEmailNotifications = notifications.filter(notification => notification.isEmail == true);
            usersWhoWantEmailNotifications = usersWhoWantEmailNotifications.map(notification => notification.username);

            let params2 = {TableName: 'Users'};
            DynamoDB.scan(params2, function(err, data) {
                if (err) return callback(null, {message: err});

                // send email
                let users = data.Items.filter(user => usersWhoAreSubscribed.includes(user.username) && usersWhoWantEmailNotifications.includes(user.username));
                let emails = users.map(user => user.email);

                let eParams = {
                    Destination: {
                        ToAddresses: emails
                    },
                    Message: {
                        Body: {
                            Text: {
                                Data: "You have received a new notification in organization " + organization + '.'
                            }
                        },
                        Subject: {
                            Data: "New notification"
                        }
                    },
                    Source: "so222et@student.lnu.se"
                };

                ses.sendEmail(eParams, function(err, data){
                    if (err) return callback(null, {message: err});

                    context.succeed(event);
                });

                // // Trigger email server
                // let postdata2 = querystring.stringify({
                //     'data': emails
                // });

                // let options2 = {
                //     hostname: '8c16e028.ngrok.io',
                //     port: 80,
                //     path: '/sendemail',
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/x-www-form-urlencoded'
                //     }
                // };
        
                // let req2 = https.request(options2);
        
                // req2.write(postdata2);
                // req2.end();
            });
        });

        // Send web socket to users
        let users = JSON.stringify(usersWhoAreSubscribed);
        let postdata = querystring.stringify({
            'users': users
        });

        // b7e984e0.ngrok.io
        let options = {
            hostname: 'ec2-18-197-144-88.eu-central-1.compute.amazonaws.com',
            port: 81,
            path: '/webhook',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        let req = https.request(options);

        req.write(postdata);
        req.end();
    });
};

const AWS = require('aws-sdk');
var moment = require('moment');
exports.handler = async (event) => {
    let inputObject = event.queryStringParameters;
    var docClient = new AWS.DynamoDB.DocumentClient();

    //웹소켓에 접속하면 부여되는 connectionId를 DB에 저장한다.
    const item = {
        room_id: inputObject.room_id,
        connection_id: event.requestContext.connectionId,
        user_id: inputObject.user_id,
        timestamp: moment().valueOf()
    }
    try {
        var params = {
            TableName: 'chatapp-userlist',
            Item: item
        };
        await docClient.put(params).promise();
        let response = {
            isBase64Encoded: true,
            statusCode: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Expose-Headers": "*",
                "Access-Control-Allow-Origin": "*",
            },
            body: "ok"
        };
        return response;
    } catch (e) {
        console.log(e);
        return "error";
    }

};
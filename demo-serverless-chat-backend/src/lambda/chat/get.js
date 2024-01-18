var AWS = require("aws-sdk");
AWS.config.update({
    region: "ap-northeast-2"
});
exports.handler = async function (event, context) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    //채팅 메세지를 가져온다.
    var params = {
        TableName: 'chatapp-chat-messages',
        KeyConditionExpression: '#HashKey = :hkey',
        ExpressionAttributeNames: { '#HashKey': 'room_id' },
        ExpressionAttributeValues: {
            ':hkey': event.queryStringParameters.room_id
        }
    };
    try {
        const result = await docClient.query(params).promise();
        let response = {
            isBase64Encoded: true,
            statusCode: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Expose-Headers": "*",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(result.Items)
        };
        return response
    }
    catch (e) {
        console.log(e)
        let response = {
            isBase64Encoded: true,
            statusCode: 500,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify("error")
        };
        //console.log(response);
        return response;
    }
}

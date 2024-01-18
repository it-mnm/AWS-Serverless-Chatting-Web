const AWS = require('aws-sdk');
var moment = require('moment');
exports.handler = async (event, context) => {
    var docClient = new AWS.DynamoDB.DocumentClient();
    const inputObject = JSON.parse(event.body);

    //우선 해당 채팅방의 접속한 모든 유저를 가져온다.
    var params = {
        TableName: 'chatapp-userlist',
        IndexName: 'room_id-user_id-index',
        KeyConditionExpression: '#HashKey = :hkey',
        ExpressionAttributeNames: { '#HashKey': 'room_id' },
        ExpressionAttributeValues: {
            ':hkey': inputObject.room_id
        }
    };
    const result = await docClient.query(params).promise();
    const now = moment().valueOf();

    //채팅을 DB에 저장한다.
    const item = {
        room_id: inputObject.room_id,
        timestamp: now,
        message: inputObject.text,
        user_id: inputObject.user_id,
        name: inputObject.name,
    };
    var params = {
        TableName: 'chatapp-chat-messages',
        Item: item
    };
    await docClient.put(params).promise();

    //이전에 불러온 방에 접속한 유저들 모두에게 채팅을 보낸다.
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: `${process.env.socket_api_gateway_id}.execute-api.ap-northeast-2.amazonaws.com/dev`
    });
    if (result.Items) {
        const postCalls = result.Items.map(async ({ connection_id }) => {
            const dt = { ConnectionId: connection_id, Data: JSON.stringify(item) };
            try {
                await apigwManagementApi.postToConnection(dt).promise();
            } catch (e) {
                console.log(e);
                //만약 이 접속은 끊긴 접속이라면, DB에서 삭제한다.
                if (e.statusCode === 410) {
                    console.log(`Found stale connection, deleting ${connection_id}`);
                    var params = {
                        TableName: 'chatapp-userlist',
                        Key: {
                            connection_id: connection_id
                        }
                    };
                    await docClient.delete(params).promise();
                }
            }
        });
        try {
            await Promise.all(postCalls);
        } catch (e) {
            return { statusCode: 500, body: e.stack };
        }
    }
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
};
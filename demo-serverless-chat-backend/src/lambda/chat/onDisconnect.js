const AWS = require('aws-sdk');


exports.handler = async event => {
  var docClient = new AWS.DynamoDB.DocumentClient();
  //웹소켓의 연결이 해제되면 Connection ID를 삭제한다.
  var params = {
    TableName: 'chatapp-userlist',
    Key: {
      connection_id: event.requestContext.connectionId
    }
  };
  await docClient.delete(params).promise();
  return "Disconnected";
};
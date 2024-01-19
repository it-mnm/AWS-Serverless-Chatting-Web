# 다중 채팅방을 서버리스 환경에서!

## 👨🏻‍💻프로젝트 간단요약

AWS의 서버리스 서비스를 활용하여 채팅방을 구현하였습니다.

- 서비스 시연영상

    <img src="![채팅웹 Demo](https://github.com/it-mnm/Serverless-Chatting-Web/assets/137988290/83a773e8-8d54-4c2d-914a-338a9092253f)">
    

---

## 🙋🏻나는 무엇을 했는가?

1. node.js로 API 및 Lambda함수를 구현하였습니다.
    - get.js
        
        ```jsx
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
        ```
        
    - onConnect.js
        
        ```jsx
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
        ```
        
    - onDisconnect.js
        
        ```jsx
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
        ```
        
    - Put.js
        
        ```jsx
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
        ```
        
    - serverless.yaml
        
        ```yaml
        service: chatapp
        app: chatapp
        provider:
          name: aws
          runtime: nodejs16.x
        #이 프로젝트의 Lambda 함수에서 사용할 IAM Role, 정의는 아래 DefaultRole
          iam:
            role: DefaultRole
          region: ap-northeast-2
          versionFunctions: false
        #스택 명  
          stackName: serverless-chat-backend
        #Lambda의 타임아웃 시간, 여기 설정하면 모든 Lambda에 공통 적용
          timeout: 10
          environment:
            version: ${opt:ver, "1"}
            tersion: ${opt:ter, "1"}
            api_gateway_id:
              Ref: ApiGatewayRestApi
            socket_api_gateway_id:
              Ref: WebsocketsApi
          deploymentBucket:
            name: ${aws:accountId}-${self:app}
            maxPreviousDeploymentArtifacts: 5
            blockPublicAccess: true
          deploymentPrefix: ${self:app}
        resources:
          Resources:
        #람다를 위한 IAM Role 정의
            DefaultRole:
              Type: AWS::IAM::Role
              Properties:
                RoleName: chatapp-lambda-role
                AssumeRolePolicyDocument:
                  Version: '2012-10-17'
                  Statement:
                    - Effect: Allow
                      Principal:
                        Service:
                          - lambda.amazonaws.com
                      Action: sts:AssumeRole
                ManagedPolicyArns:
                  - arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
                Policies:
                  - PolicyName: myPolicyName
                    PolicyDocument:
                      Version: '2012-10-17'
                      Statement:
                        - Effect: Allow
                          Action:
                            - logs:*
                            - execute-api:*
                          Resource: '*'
            #DynamoDB 테이블, 채팅메세지
            messageTable:
              Type: AWS::DynamoDB::Table
              Properties:
                TableName: chatapp-chat-messages
                AttributeDefinitions:
                  - AttributeName: room_id 
                    AttributeType: S
                  - AttributeName: timestamp
                    AttributeType: N
                KeySchema:
                  - AttributeName: room_id
                    KeyType: HASH
                  - AttributeName: timestamp
                    KeyType: RANGE
                BillingMode: PAY_PER_REQUEST
            #DynamoDB 테이블, 유저 목록
            userListTable:
              Type: AWS::DynamoDB::Table
              Properties:
                TableName: chatapp-userlist
                AttributeDefinitions:
                  - AttributeName: connection_id 
                    AttributeType: S
                  - AttributeName: room_id
                    AttributeType: S
                  - AttributeName: user_id
                    AttributeType: S
                KeySchema:
                  - AttributeName: connection_id
                    KeyType: HASH
                BillingMode: PAY_PER_REQUEST
                GlobalSecondaryIndexes:
                  - IndexName: room_id-user_id-index
                    KeySchema:
                      - AttributeName: room_id
                        KeyType: HASH
                      - AttributeName: user_id
                        KeyType: RANGE
                    Projection:
                      ProjectionType: ALL
        
        #Serverless 플러그인
        plugins:
        #Deploymenet 버킷 자동 생성 플러그인
          - serverless-deployment-bucket
        #자동으로 Nested Stack 기반으로 CloudFormation을 생성해주는 플러그인 https://github.com/dougmoscrop/serverless-plugin-split-stacks
          - serverless-plugin-split-stacks
        
        #위의 serverless-plugin-split-stacks 관련 설정 
        custom:
          splitStacks:
            nestedStackCount: 5
            perFunction: false
            perType: false
            perGroupFunction: true
        
        #람다 함수들
        functions:
          chat_onConnect:
            name: 'chat_onConnect'
            handler: src/lambda/chat/onConnect.handler
            events:
              - websocket:
                  route: $connect
          chat_put:
            name: 'chat_put'
            handler: src/lambda/chat/put.handler
            events:
              - http:
                  path: chat
                  method: put
                  cors: true
          chat_onDisconnect:
            name: 'chat_onDisconnect'
            handler: src/lambda/chat/onDisconnect.handler
            events:
              - websocket:
                  route: $disconnect
          chat_get:
            name: 'chat_get'
            handler: src/lambda/chat/get.handler
            events:
              - http:
                  path: chat
                  method: get
                  cors: true
        ```
        
    
2. AWS 환경에서 채팅 웹을 Amplify에 배포하였습니다. 이때 Serverless Framework를 활용하여 AWS CloudFormation에 Lambda 함수와 APIGateway를 동시 배포하였습니다.
    - Architecture
        
        ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/df3849f7-f233-4fe8-88e6-7e7528b6fb56/e8b7ae56-ef8b-493c-8ed6-6f06553e6d28/Untitled.png)
        
    - 배포
        - Lambda 배포
            
            ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/df3849f7-f233-4fe8-88e6-7e7528b6fb56/1d02e577-4a5a-4ed1-adb9-331f25d1601b/Untitled.png)
            
            ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/df3849f7-f233-4fe8-88e6-7e7528b6fb56/9eb39c25-708f-4f5c-8007-f3089847d71a/Untitled.png)
            
            ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/df3849f7-f233-4fe8-88e6-7e7528b6fb56/154c0e52-644a-45aa-978a-20273ba0633e/Untitled.png)
            
            ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/df3849f7-f233-4fe8-88e6-7e7528b6fb56/c024e619-f178-44f7-8b74-fd7017aa129a/Untitled.png)
            
            ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/df3849f7-f233-4fe8-88e6-7e7528b6fb56/bdf14b76-a7f1-415a-8b26-2c2a5995ab0c/Untitled.png)
            
        - Amplify 배포
            
            ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/df3849f7-f233-4fe8-88e6-7e7528b6fb56/1d453788-1bb7-49f2-b128-494e186010b9/Untitled.png)
            
            ![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/df3849f7-f233-4fe8-88e6-7e7528b6fb56/259b20cf-738f-4728-b24d-2677fd954c96/Untitled.png)
            
        
    

---

## 📖나는 무엇을 배웠는가?

1. Static Web Hosting을 위해 이전에는 S3에 배포하였다**. 이번에는 Amplify를 사용해보았는데, S3에 배포한 것보다 쉽고 편리함을 느꼈다.** Amplify 내부에는 기본적으로 CloudFront와 S3의 기능이 내장되어있어서 기본적으로는 유사하다. 또한, Amplify에서는 여러 툴(git hub, git lab, AWS Code Commit 등)들과 연동을 할 수 있어서 빌드만 하면 자동으로 배포할 수 있었다. **다만, 쉬운 대신 트래픽 비용과 빌드 비용이 S3에 비해 비싸다. 추가로, S3에 반해 세부설정을 할 수 있는 기능을 지원하지 않는다.**
2. **Serverless Framework 사용방법을 익혔다.** Lambda 함수가 많아질 수록 일일이 배포하고 API와 연결하는 것은 불가능에 가깝다. CloudFormation을 동반하여 대규모 인프라를 쉽게 배포하기 위해 Serverless Framework를 사용하는 것도 좋은 방법이 될 것 같다.

---

## ➕앞으로 무엇을 더 보완할 수 있는가?

1. 채팅 기능을 아주 간단하게 구현하였기 때문에 **기능적인 측면에서 더 디벨롭** 할 수 있다.
2. **OpenAI API를 사용**하여 프롬프트 기능을 서버리스 환경에서도 구현할 수 있을 것으로 보인다. (추후에 해볼 예정)

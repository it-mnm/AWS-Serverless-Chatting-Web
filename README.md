# 다중 채팅방을 서버리스 환경에서!

## 👨🏻‍💻프로젝트 간단요약

AWS의 서버리스 서비스를 활용하여 채팅방을 구현하였습니다.

- 서비스 시연영상

    <img src="https://github.com/it-mnm/Serverless-Chatting-Web/assets/137988290/83a773e8-8d54-4c2d-914a-338a9092253f">
    

---

## 🙋🏻나는 무엇을 했는가?

1. node.js로 API 및 Lambda함수를 구현하였습니다.
      
    
2. AWS 환경에서 채팅 웹을 Amplify에 배포하였습니다. 이때 Serverless Framework를 활용하여 AWS CloudFormation에 Lambda 함수와 APIGateway를 동시 배포하였습니다.
    - Architecture
        <img src="https://github.com/it-mnm/Serverless-Chatting-Web/assets/137988290/0dad1f1e-4abe-41f3-a31e-bf633a259c8a">
        
      
        
    - 배포
        - Lambda 배포
          <img src="https://github.com/it-mnm/Serverless-Chatting-Web/assets/137988290/4418975c-c57f-4400-aa5b-538bebb20ec7">
            <img src="https://github.com/it-mnm/Serverless-Chatting-Web/assets/137988290/a8af2355-4192-46fc-9220-c5bc022c84d0">
            <img src="https://github.com/it-mnm/Serverless-Chatting-Web/assets/137988290/cacda95f-eef4-4be4-a00d-4065ed0a9e12">
            <img src=" https://github.com/it-mnm/Serverless-Chatting-Web/assets/137988290/92d23da6-d490-4957-8441-a4fca2442c68">
            <img src="https://github.com/it-mnm/Serverless-Chatting-Web/assets/137988290/00b28ca0-5e6e-4ae3-9378-64be38cca600">



            
        - Amplify 배포
          <img src="https://github.com/it-mnm/Serverless-Chatting-Web/assets/137988290/090a97f8-3d6c-4e35-953f-3c06e0657cc6">

            <img src="https://github.com/it-mnm/Serverless-Chatting-Web/assets/137988290/da0fa22f-d5be-4379-87bb-f0e3e272063a">

            
        
    

---

## 📖나는 무엇을 배웠는가?

1. Static Web Hosting을 위해 이전에는 S3에 배포하였다**. 이번에는 Amplify를 사용해보았는데, S3에 배포한 것보다 쉽고 편리함을 느꼈다.** Amplify 내부에는 기본적으로 CloudFront와 S3의 기능이 내장되어있어서 기본적으로는 유사하다. 또한, Amplify에서는 여러 툴(git hub, git lab, AWS Code Commit 등)들과 연동을 할 수 있어서 빌드만 하면 자동으로 배포할 수 있었다. **다만, 쉬운 대신 트래픽 비용과 빌드 비용이 S3에 비해 비싸다. 추가로, S3에 반해 세부설정을 할 수 있는 기능을 지원하지 않는다.**
2. **Serverless Framework 사용방법을 익혔다.** Lambda 함수가 많아질 수록 일일이 배포하고 API와 연결하는 것은 불가능에 가깝다. CloudFormation을 동반하여 대규모 인프라를 쉽게 배포하기 위해 Serverless Framework를 사용하는 것도 좋은 방법이 될 것 같다.

---

## ➕앞으로 무엇을 더 보완할 수 있는가?

1. 채팅 기능을 아주 간단하게 구현하였기 때문에 **기능적인 측면에서 더 디벨롭** 할 수 있다.
2. **OpenAI API를 사용**하여 프롬프트 기능을 서버리스 환경에서도 구현할 수 있을 것으로 보인다. (추후에 해볼 예정)

import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";

export class SocketConnect {
    public static async connect(event: APIGatewayProxyWebsocketEventV2) {
        console.log({event});
        return { statusCode: 200 };
    }
}
import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";

export class SocketDisconnect {
    public static async disconnect(event: APIGatewayProxyWebsocketEventV2) {
        console.log({event});
        return { statusCode: 200 };
    }
}
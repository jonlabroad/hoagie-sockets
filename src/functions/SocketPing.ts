import { APIGatewayEventWebsocketRequestContextV2 } from "aws-lambda";
import { MessageBroadcaster } from "../MessageBroadcaster";

export class SocketPing {
  public static async ping(
    requestContext: APIGatewayEventWebsocketRequestContextV2,
    body: string
  ): Promise<any> {
    await MessageBroadcaster.sendPong(requestContext.connectionId, requestContext.domainName);
    return { statusCode: 200, body: "pong" };
  }
}

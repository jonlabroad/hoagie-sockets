import { APIGatewayEventWebsocketRequestContextV2 } from "aws-lambda";
import { ConnectionInfoFactory } from "./persistance/ConnectionInfoFactory";
import { RequestBody } from "./persistance/RequestBody";
import { ConnectionInfoProvider } from "./persistance/ConnectionInfoProvider";

export class SocketSubscribe {
  public static async subscribe(
    requestContext: APIGatewayEventWebsocketRequestContextV2,
    body: string
  ): Promise<any> {
    console.log({ requestContext });

    let parsedBody: RequestBody;
    try {
      parsedBody = JSON.parse(body ?? "{}") as RequestBody;
    } catch (err) {
      return {
        statusCode: 400,
        body: "Unable to parse ping message body",
      };
    }

    const connectionInfo = ConnectionInfoFactory.fromRequest(
      requestContext,
      parsedBody
    );
    if (!connectionInfo) {
      return {
        statusCode: 400,
        body: "Unable to create subscription",
      };
    }

    const connectionProvider = new ConnectionInfoProvider();
    await connectionProvider.set(connectionInfo);

    return { statusCode: 200 };
  }
}

import { APIGatewayEventWebsocketRequestContextV2 } from "aws-lambda";
import { ConnectionInfo } from "./ConnectionInfo";
import { RequestBody } from "./RequestBody";

export class ConnectionInfoFactory {
    public static fromRequest(context: APIGatewayEventWebsocketRequestContextV2, body: RequestBody): ConnectionInfo | null {
        if (!body.topic) {
            console.error(`Incoming request does not include a topic`);
            return null;
        }

        return {
            id: context.connectionId,
            topic: body.topic,
            timestamp: context.requestTimeEpoch,
            endpoint: context.domainName,
            data: body.data,
        }
    }
}
import { ConnectionInfoProvider } from "./persistance/ConnectionInfoProvider";
import { ConnectionInfo } from "./persistance/ConnectionInfo";
import { MessageBroadcaster } from "../MessageBroadcaster";
import { APIGatewayEventWebsocketRequestContextV2 } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";

export interface TopicInfo {
  id: string;
  connections: ConnectionInfo[];
}

export class GetAllConnections {
  public static async getAll(
    requestContext: APIGatewayEventWebsocketRequestContextV2
  ) {
    const topicConnections = await new ConnectionInfoProvider().getAll();
    await Promise.all(
      topicConnections.map(async (topicConnection) => {
        await Promise.all(
          topicConnection.connections.map(async (connection) => {
            const id = connection.id;
            const endpoint = connection.endpoint;
            const agApi = new ApiGatewayManagementApi({
              endpoint: endpoint,
            });

            let awsConnection: any;
            try {
              awsConnection = await agApi
                .getConnection({
                  ConnectionId: id,
                })
                .promise();
            } catch (err) {}
            if (awsConnection) {
              (connection as any).aws = awsConnection;
            }
          })
        );
      })
    );

    await MessageBroadcaster.sendTo(
      requestContext.connectionId,
      requestContext.domainName,
      JSON.stringify(topicConnections)
    );

    return {
      statusCode: 200,
    };
  }
}

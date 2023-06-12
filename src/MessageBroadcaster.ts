import { ApiGatewayManagementApi } from "aws-sdk";
import { ConnectionInfoProvider } from "./functions/persistance/ConnectionInfoProvider";
import { ConnectionInfo } from "./functions/persistance/ConnectionInfo";
import Bottleneck from "bottleneck";

export class MessageBroadcaster {
  public static async broadcast(topic: string, data: string) {
    const connections = await this.getConnectionsForTopic(topic);
    console.log({ connections });

    const limiter = new Bottleneck({
      maxConcurrent: 10,
    });

    await limiter.schedule(() =>
      Promise.all(
        connections.map(async (connection) => {
          try {
            console.log(`Sending to ${connection.id} ${connection.topic}`);
            return await this.sendToConnection(connection, data);
          } catch (err) {
            await this.handleSendError(connection, err);
            return Promise.resolve(undefined);
          }
        })
      )
    );
  }

  private static async sendToConnection(
    connection: ConnectionInfo,
    data: string
  ) {
    if (connection.endpoint) {
      const apiGatewayManagementApi = new ApiGatewayManagementApi({
        endpoint: connection.endpoint,
      });
      const result = await apiGatewayManagementApi
        .postToConnection({
          ConnectionId: connection.id,
          Data: data,
        })
        .promise();
      console.log({ result });
      return result;
    }
  }

  private static async handleSendError(connection: ConnectionInfo, err: any) {
    // 410 means the connection doesn't exist anymore
    const statusCode = err.statusCode;
    if (statusCode === 410) {
      console.log(`Deleting stale connection ${connection.id} - ${connection.topic}`);
      await new ConnectionInfoProvider().delete(connection.id, connection.topic);
    } else {
      console.error(err);
    }
  }

  private static async getConnectionsForTopic(topic: string) {
    const connectionProvider = new ConnectionInfoProvider();
    const connections = await connectionProvider.getTopicConnections(topic);
    return connections;
  }
}

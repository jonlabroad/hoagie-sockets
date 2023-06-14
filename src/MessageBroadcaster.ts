import { ApiGatewayManagementApi } from "aws-sdk";
import { ConnectionInfoProvider } from "./functions/persistance/ConnectionInfoProvider";
import { ConnectionInfo } from "./functions/persistance/ConnectionInfo";
import Bottleneck from "bottleneck";
import { HoagieTopicEvent } from "./HoagieEvent";

export class MessageBroadcaster {
  public static async broadcast(topic: string, type: string, data: object) {
    const connections = await this.getConnectionsForTopic(topic);
    console.log({ connections });

    const limiter = new Bottleneck({
      maxConcurrent: 10,
    });

    const message: HoagieTopicEvent = {
      topic,
      type,
      data
    };

    await limiter.schedule(() =>
      Promise.all(
        connections.map(async (connection) => {
          try {
            console.log(`Sending to ${connection.id} ${connection.topic}`);
            return await this.sendToConnection(connection, message);
          } catch (err) {
            await this.handleSendError(connection, err);
            return Promise.resolve(undefined);
          }
        })
      )
    );
  }

  public static async sendToConnection(
    connection: ConnectionInfo,
    message: HoagieTopicEvent,
  ) {
    if (connection.endpoint) {
      return this.sendTo(connection.id, connection.endpoint, JSON.stringify(message));
    }
  }

  public static async sendTo(connectionId: string, endpoint: string, data: string) {
    const apiGatewayManagementApi = new ApiGatewayManagementApi({
      endpoint,
    });
    const result = await apiGatewayManagementApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: data,
      })
      .promise();
    console.log({ result });
    return result;
  }

  public static async sendPong(
    connectionId: string,
    endpoint: string
  ) {
      const apiGatewayManagementApi = new ApiGatewayManagementApi({
        endpoint,
      });
      apiGatewayManagementApi.getConnection({
        ConnectionId: connectionId
      }).promise();
      const result = await apiGatewayManagementApi
        .postToConnection({
          ConnectionId: connectionId,
          Data: "pong",
        })
        .promise();
      return result;
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

import { ConnectionInfo } from "./ConnectionInfo";
import { DynamoDB } from "aws-sdk";
import { RequestBody } from "./RequestBody";
import { ConnectionInfoFactory } from "./ConnectionInfoFactory";
import Config from "../../Config";

const defaultExpirySec = 8 * 60 * 60;
//const defaultExpirySec = 10 * 60;

export class ConnectionInfoProvider {
  async getTopicConnections(topic: string): Promise<ConnectionInfo[]> {
    const key = this.getCategoryKey(topic);
    const request: DynamoDB.DocumentClient.QueryInput = {
      TableName: Config.tableName,
      KeyConditionExpression: "CategoryKey = :catKey",
      ExpressionAttributeValues: {
        ":catKey": key,
      },
    };

    const client = this.getClient();
    const response = await this.wrapInConsoleError(async () => {
      return await client.query(request).promise();
    });

    return (
      response.Items?.map((item) => item.connectionInfo as ConnectionInfo).filter(c => !!c) ?? []
    );
  }

  async set(connectionInfo: ConnectionInfo) {
    const key = this.createKey(connectionInfo.id, connectionInfo.topic);
    const request: DynamoDB.DocumentClient.PutItemInput = {
      TableName: Config.tableName,
      Item: {
        ...key,
        connectionInfo: connectionInfo,
        ExpirationTTL: Math.floor(connectionInfo.timestamp / 1e3 + defaultExpirySec),
      },
    };

    const client = this.getClient();
    await this.wrapInConsoleError(async () => {
      await client.put(request).promise();
    });
  }

  async delete(connectionId: string, topic: string) {
    const key = this.createKey(connectionId, topic);

    const request: DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: Config.tableName,
      Key: key
    };

    const client = this.getClient();
    await this.wrapInConsoleError(async () => {
      await client.delete(request).promise();
    });
  }

  async ping(connectionInfo: ConnectionInfo) {
    // Update existing entry, if no current entry exists, we likely have some sort of issue :)
    const key = this.createKey(connectionInfo.id, connectionInfo.topic);

    const request: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: Config.tableName,
      Key: key,
      UpdateExpression: "SET #ExpirationTTL = :expiration",
      ExpressionAttributeNames: {
        "#ExpirationTTL": "ExpirationTTL",
      },
      ExpressionAttributeValues: {
        ":expiration": connectionInfo.timestamp / 1e3 + defaultExpirySec,
      },
    };
    console.log({ request });

    const client = this.getClient();
    await this.wrapInConsoleError(async () => {
      await client.update(request).promise();
    });
  }

  async wrapInConsoleError(wrapped: () => Promise<any>) {
    let result: any = undefined;
    try {
      result = await wrapped();
    } catch (err) {
      console.error(err);
    }
    return result
  }

  private createKey(connectionId: string, topic: string) {
    return {
      CategoryKey: this.getCategoryKey(topic),
      SubKey: this.getSortKey(connectionId),
    };
  }

  private getCategoryKey(topic: string) {
    return `${ConnectionInfoProvider.KeyBase}_TOPIC_${topic.toLowerCase()}`;
  }

  private getSortKey(connectionId: string) {
    return connectionId;
  }

  private getClient() {
    return new DynamoDB.DocumentClient();
  }

  private static KeyBase = "hoagiesocketsConnections";
}

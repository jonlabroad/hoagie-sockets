import { DynamoDB } from "aws-sdk";
import Config from "../../Config";

const defaultExpirySec = 14 * 24 * 60 * 60; // 14 days

export class TopicInfoProvider {
  async set(topicId: string) {
    const key = this.createKey(topicId);
    const request: DynamoDB.DocumentClient.PutItemInput = {
      TableName: Config.tableName,
      Item: {
        ...key,
        ExpirationTTL: Math.floor(Date.now() / 1e3 + defaultExpirySec),
      },
    };

    const client = this.getClient();
    await this.wrapInConsoleError(async () => {
      await client.put(request).promise();
    });
  }

  async getAllTopicIds(): Promise<string[]> {
    const key = this.getCategoryKey();
    const request: DynamoDB.DocumentClient.QueryInput = {
      TableName: Config.tableName,
      KeyConditionExpression: "CategoryKey = :topicInfo",
      ExpressionAttributeValues: {
        ":topicInfo": key,
      },
    };
    const client = this.getClient();
    const response = await this.wrapInConsoleError(async () => {
      return await client.query(request).promise();
    });
    return response?.Items?.map(item => item.SubKey) as string[];
  }

  async wrapInConsoleError<T>(wrapped: () => Promise<T>): Promise<T | undefined> {
    let result: T | undefined = undefined;
    try {
      result = await wrapped();
    } catch (err) {
      console.error(err);
    }
    return result
  }

  private createKey(topic: string) {
    return {
      CategoryKey: this.getCategoryKey(),
      SubKey: this.getSortKey(topic),
    };
  }

  private getCategoryKey() {
    return `${TopicInfoProvider.KeyBase}_TOPICINFO`;
  }

  private getSortKey(topicId: string) {
    return topicId;
  }

  private getClient() {
    return new DynamoDB.DocumentClient();
  }

  public static KeyBase = "hoagiesocketsConnections";
}

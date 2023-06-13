import { MessageBroadcaster } from "../MessageBroadcaster";

export class SocketBroadcast {
  public static async broadcast(event: any) {
    const topic = event.detail.topic as string;
    const topicType = topic.slice(0, topic.indexOf('.'));
    const data = event.detail;
    await MessageBroadcaster.broadcast(topic, topicType, data);
    console.log(`Broadcasted to topic '${topic}'`);

    return { statusCode: 200 };
  }
}

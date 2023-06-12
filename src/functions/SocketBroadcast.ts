import { MessageBroadcaster } from "../MessageBroadcaster";

export class SocketBroadcast {
  public static async broadcast(event: any) {
    const topic = event.detail.topic;
    const data = event.detail;
    await MessageBroadcaster.broadcast(topic, JSON.stringify(data));
    console.log(`Broadcasted to topic '${topic}'`);

    return { statusCode: 200 };
  }
}

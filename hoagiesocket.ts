import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
  Context,
} from "aws-lambda";
import { SocketPing } from "./src/functions/SocketPing";
import { SocketSubscribe } from "./src/functions/SocketSubscribe";
import { SocketDisconnect } from "./src/functions/SocketDisconnect";
import { SocketConnect } from "./src/functions/SocketConnect";
import { MessageBroadcaster } from "./src/MessageBroadcaster";
import { SocketBroadcast } from "./src/functions/SocketBroadcast";
import { GetAllConnections } from "./src/functions/GetAllConnections";

export const connect = async (
  event: APIGatewayProxyWebsocketEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  return await SocketConnect.connect(event);
};

export const disconnect = async (
  event: APIGatewayProxyWebsocketEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  return await SocketDisconnect.disconnect(event);
};

export const subscribe = async (
  event: APIGatewayProxyWebsocketEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  return await SocketSubscribe.subscribe(event.requestContext, event.body ?? "{}");
};

export const ping = async (
  event: APIGatewayProxyWebsocketEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  return await SocketPing.ping(event.requestContext, event.body ?? "{}");
};

export const broadcast = async (
  event: any,
  context: Context
): Promise<any> => {
  return await SocketBroadcast.broadcast(event);
};

export const getallconnections = async (
  event: APIGatewayProxyWebsocketEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  return await GetAllConnections.getAll(event.requestContext);
};

export const clientSendTest = async () => {
  await MessageBroadcaster.broadcast("dono.272628458", "dono", { msg: "THIS IS JUST A TEST!" } );
};

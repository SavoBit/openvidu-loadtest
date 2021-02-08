import { WebSocketWithReconnection } from "openvidu-browser/src/OpenViduInternal/KurentoUtils/kurento-jsonrpc/clients/transports/webSocketWithReconnection";
const WebSocket = require("ws");

import { OPENVIDU_CERTTYPE } from "../../../../../../config";

export class WebSocketWithReconnectionOverride extends WebSocketWithReconnection {
	constructor(config) {
		super(config);
	}

	protected createWebSocket(): WebSocket {
		const allowInsecureDeployment =
			!!OPENVIDU_CERTTYPE && OPENVIDU_CERTTYPE.toLowerCase() === "selfsigned";
		return new WebSocket(this.wsUri, {
			rejectUnauthorized: !allowInsecureDeployment,
		});
	}
}

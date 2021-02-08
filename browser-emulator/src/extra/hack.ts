(<any>globalThis.window) = {console: console};
import OpenVidu = require('openvidu-browser/lib/OpenVidu/OpenVidu');
import Publisher = require('openvidu-browser/lib/OpenVidu/Publisher');
import WebSocketWithReconnection = require('openvidu-browser/src/OpenViduInternal/KurentoUtils/kurento-jsonrpc/clients/transports/WebSocketWithReconnection');
import {PublisherOverride} from '../openvidu-browser/OpenVidu/Publisher';
import { OPENVIDU_CERTTYPE } from "../config";
import { WebSocketWithReconnectionOverride } from '../openvidu-browser/OpenViduInternal/KurentoUtils/kurento-jsonrpc/clients/transports/webSocketWithReconnection';

const WebSocket = require("ws");
const RTCPeerConnectionWRTC = require('wrtc').RTCPeerConnection;
const RTCIceCandidateWRTC = require('wrtc').RTCIceCandidate;
const RTCSessionDescriptionWRTC = require('wrtc').RTCSessionDescription;
const mediaDevicesWRTC = require('wrtc').mediaDevices;
const MediaStreamWRTC = require('wrtc').MediaStream;
const MediaStreamTrackWRTC = require('wrtc').MediaStreamTrack;
const getUserMediaWRTC = require('wrtc').getUserMedia;
const LocalStorage = require('node-localstorage').LocalStorage;


export class Hack {
	constructor() {

		(<any>globalThis.navigator) = {
			userAgent: 'NodeJS Testing'
		};
		(<any>globalThis.document) = {};
		globalThis.localStorage = new LocalStorage('./');

	}

	webrtc() {

		globalThis.RTCPeerConnection = RTCPeerConnectionWRTC;
		// window['RTCPeerConnection'] = RTCPeerConnection;
		window['RTCIceCandidate'] = RTCIceCandidateWRTC;
		window['RTCSessionDescription'] = RTCSessionDescriptionWRTC;
		window['getUserMedia'] = getUserMediaWRTC;
		window['MediaStream'] = MediaStreamWRTC;
		window['MediaStreamTrack'] = MediaStreamTrackWRTC;
		(<any>globalThis.navigator)['mediaDevices'] = mediaDevicesWRTC;

	}

	websocket() {
		// selfsigned environmets will be rejected. This will only work with secure environments
		// Adding '{rejectUnauthorized: false}'  in the construcor of the WebSocket in this line
		// https://github.com/OpenVidu/openvidu/blob/c4ca3863ce183eed2083ebe78f0eafb909eea7e1/openvidu-browser/src/OpenViduInternal/KurentoUtils/kurento-jsonrpc/clients/transports/webSocketWithReconnection.js#L44
		//  selfisgned environmets will be enabled
		// const allowInsecureDeployment  = !!OPENVIDU_CERTTYPE && OPENVIDU_CERTTYPE.toLowerCase() === 'selfsigned';
		// console.log("reject", !allowInsecureDeployment)
		// WebSocket.prototype.options = {rejectUnauthorized: !allowInsecureDeployment };
		globalThis.WebSocket = WebSocket;
	}

	openviduBrowser(){

		OpenVidu.OpenVidu = ((original) => {
			OpenVidu.OpenVidu.prototype.checkSystemRequirements = () => {return 1};
			return OpenVidu.OpenVidu;
		})(OpenVidu.OpenVidu);

		Publisher.Publisher = ((original) => {
			Publisher.Publisher.prototype.initializeVideoReference = PublisherOverride.prototype.initializeVideoReference;
			Publisher.Publisher.prototype.getVideoDimensions = PublisherOverride.prototype.getVideoDimensions;
			return PublisherOverride;
		})(Publisher.Publisher);

		WebSocketWithReconnection.WebSocketWithReconnection = ((original) => {
			WebSocketWithReconnection.WebSocketWithReconnection.prototype = WebSocketWithReconnectionOverride.prototype;
			return WebSocketWithReconnection.WebSocketWithReconnection;
		})(WebSocketWithReconnection.WebSocketWithReconnection);
	}

	// private async changeWebSocketConstructor(): Promise<void> {
	// 	console.log('Preparing webcomponent files ...');

	// 	console.log("allow => ", OPENVIDU_CERTTYPE);
	// 	const allowInsecureDeployment  = !!OPENVIDU_CERTTYPE && OPENVIDU_CERTTYPE.toLowerCase() === 'selfsigned';
	// 	const openviduWebsocketPath = './node_modules/openvidu-browser/lib/OpenViduInternal/KurentoUtils/kurento-jsonrpc/clients/transports/webSocketWithReconnection.js';
	// 	let regexFrom = /= new WebSocket\(wsUri\);/g;
	// 	let newString = '= new WebSocket(wsUri, {rejectUnauthorized: ' + !allowInsecureDeployment + '});';

	// 	let options = {
	// 		files: openviduWebsocketPath,
	// 		from:  regexFrom,
	// 		to: newString,
	// 	  };

	// 	  try {
	// 		const results = await replace(options);
	// 		if(!results[0].hasChanged){

	// 			regexFrom = /= new WebSocket\(wsUri, {rejectUnauthorized: (.*)}\);/g;
	// 			options.from = regexFrom;
	// 			await replace(options);
	// 			console.log(" ", newString);
	// 		}
	// 	  }
	// 	  catch (error) {
	// 		console.error('Error occurred:', error);
	// 	  }

	// 	// this.replaceText(openviduWebsocketPath, /= new WebSocket\(wsUri\);/g, '= new WebSocket(wsUri, {rejectUnauthorized: ' + REJECT_UNAUTHORIZED_WS + '});');
	// 	// this.replaceText(openviduWebsocketPath, /= new WebSocket\(wsUri, {rejectUnauthorized: (.*)}\);/g, '= new WebSocket(wsUri, {rejectUnauthorized: ' + REJECT_UNAUTHORIZED_WS + '});');

	// }

	// private replaceText(file: string, originalText: string | RegExp, changedText: string) {
	// 	fs.readFile(file, 'utf8', (err, data) => {
	// 		if (err) {
	// 			return console.log(err);
	// 		}
	// 		let result = data.replace(originalText, changedText);

	// 		console.log("oks");
	// 		fs.writeFile(file, result, 'utf8', (err) => {
	// 			if (err) return console.log(err);
	// 		});
	// 	});
	// }
}


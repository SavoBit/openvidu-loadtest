import * as express from 'express';
import { Request, Response } from 'express';
import { OpenViduBrowser } from '../openvidu-browser/openvidu-browser';
import { OpenViduRole, PublisherProperties } from '../openvidu-browser/OpenVidu/OpenviduTypes';
import { InstanceService } from '../utils/instance-service';

export const app = express.Router({
    strict: true
});

const ovBrowser: OpenViduBrowser = new OpenViduBrowser();
const instanceService: InstanceService = new InstanceService();

app.post('/streamManager', async (req: Request, res: Response) => {
	try {

		if(areStreamManagerParamsCorrect(req)) {
			const token: string = req.body.token;
			const userId: string = req.body.userId;
			const sessionName: string = req.body.sessionName;
			let properties: PublisherProperties = req.body.properties;
			process.env.OPENVIDU_SECRET = req.body.openviduSecret;
			process.env.OPENVIDU_URL = req.body.openviduUrl;

			if(!properties || !properties.role) {
				// Setting default role for publisher properties
				properties.role = OpenViduRole.PUBLISHER;
			}

			const connectionId: string = await ovBrowser.createStreamManager(userId, properties, sessionName, token);
			console.log(`Created ${properties.role} ${userId} in session ${sessionName}`);
			const workerCpuUsage = await instanceService.getCpuUsage();
			return res.status(200).send({connectionId, workerCpuUsage});
		}

		console.log('Problem with some body parameter' + req.body);
		return res.status(400).send('Problem with some body parameter');
	} catch (error) {
		console.log(error);
		res.status(500).send(error);

	}
});


app.delete('/streamManager/connection/:connectionId', (req: Request, res: Response) => {
	try {
		const connectionId: string = req.params.connectionId;

		if(!connectionId){
			return res.status(400).send('Problem with connectionId parameter. IT DOES NOT EXIST');
		}
		console.log('Deleting streams with connectionId: ' + connectionId);
		ovBrowser.deleteStreamManagerWithConnectionId(connectionId);
		res.status(200).send({});
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

app.delete('/streamManager/role/:role', (req: Request, res: Response) => {
	try {
		const role: any = req.params.role;
		if(!role){
			return res.status(400).send('Problem with ROLE parameter. IT DOES NOT EXIST');
		}else if(role !== OpenViduRole.PUBLISHER && role !== OpenViduRole.SUBSCRIBER ){
			return res.status(400).send(`Problem with ROLE parameter. IT MUST BE ${OpenViduRole.PUBLISHER} or ${OpenViduRole.SUBSCRIBER}`);
		}

		console.log('Deleting streams with ROLE:' + role);
		ovBrowser.deleteStreamManagerWithRole(role);
		res.status(200).send({});
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

function areStreamManagerParamsCorrect(req: Request): boolean {
	const token: string = req.body.token;
	const openviduSecret: string = req.body.openviduSecret;
	const openviduUrl: string = req.body.openviduUrl;
	const userId: string = req.body.userId;
	const sessionName: string = req.body.sessionName;

	const tokenCanBeCreated = !!userId && !!sessionName && !!openviduUrl && !!openviduSecret;
	const tokenHasBeenReceived = !!userId && !!token;

	return tokenCanBeCreated || tokenHasBeenReceived;
}

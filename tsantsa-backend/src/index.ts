import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import useragent from 'express-useragent';
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import { appRoutes } from './network/routes';
const app = express();

process.setMaxListeners(0);

dotenv.config({
	path: path.join(path.resolve('./env'), process.env.NODE_ENV + '.env'),
});

const whitelist = ['http://localhost:5200'];
const corsOptionsDelegate = (req: any, callback: any) => {
	let corsOptions = {
		origin: false,
		optionsSuccessStatus: 200,
		exposedHeaders: ['name_report', 'message'],
	};

	if (whitelist.indexOf(req.header('Origin')) !== -1) {
		corsOptions = { ...corsOptions, origin: true }; // reflect (enable) the requested origin in the CORS response
	} else {
		corsOptions = { ...corsOptions, origin: false }; // disable CORS for this request
	}
	callback(null, corsOptions); // callback expects two parameters: error and options
};

let port;

if (process.env.NODE_ENV == 'production') {
	port = 443;
	/**
	 * Set the credentials
	 */
	const credentials = {
		cert: fs.readFileSync(path.resolve('./public.crt')),
		key: fs.readFileSync(path.resolve('./private.key')),
	};

	app.use(useragent.express());
	app.use(express.json());
	app.use(cors(corsOptionsDelegate));
	app.use(cookieParser());
	app.use(express.urlencoded({ extended: false }));
	app.use('/', express.static('./public'));
	/**
	 * Redirect http to https
	 */
	// if (process.env.NODE_ENV == 'production') {
	//     app.enable('trust proxy')
	//     app.use((req, res, next) => {
	//         req.secure ? next() : res.redirect('https://' + 'facturacion.puyo.gob.ec' + req.url)
	//     })
	// }

	app.get('/*', (req: any, res: any, next: any) => {
		/**
		 * Condition the url, if is rest then continue opposite case redirect html, because
		 * they are assumed to be webapp routes
		 */
		if (
			!(req.url.substring(1, 5) == 'rest' || req.url.substring(1, 4) == 'app')
		) {
			res.sendFile(
				path.join(path.resolve('./'), 'public/index.html'),
				(err: any) => {
					if (err) {
						res.status(500).send(err);
					}
				}
			);
		} else {
			next();
		}
	});

	appRoutes(app);

	const httpsServer = https.createServer(credentials, app);
	httpsServer.listen(port);
	console.log(`La aplicación esta escuchando en https://localhost:${port}`);
} else {
	port = 4000;

	app.use(useragent.express());
	app.use(express.json());
	app.use(cors(corsOptionsDelegate));
	app.use(cookieParser());
	app.use(express.urlencoded({ extended: false }));
	app.use('/', express.static('./public'));
	/**
	 * Redirect http to https
	 */
	// if (process.env.NODE_ENV == 'production') {
	//     app.enable('trust proxy')
	//     app.use((req, res, next) => {
	//         req.secure ? next() : res.redirect('https://' + 'facturacion.puyo.gob.ec' + req.url)
	//     })
	// }

	app.get('/*', (req: any, res: any, next: any) => {
		/**
		 * Condition the url, if is rest then continue opposite case redirect html, because
		 * they are assumed to be webapp routes
		 */
		if (
			!(req.url.substring(1, 5) == 'rest' || req.url.substring(1, 4) == 'app')
		) {
			res.sendFile(
				path.join(path.resolve('./'), 'public/index.html'),
				(err: any) => {
					if (err) {
						res.status(500).send(err);
					}
				}
			);
		} else {
			next();
		}
	});

	appRoutes(app);

	const httpServer = http.createServer(app);
	httpServer.listen(port);
	console.log(`La aplicación esta escuchando en http://localhost:${port}`);
}

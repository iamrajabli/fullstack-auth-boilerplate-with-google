import 'reflect-metadata';

import express, { type Express } from 'express';
import { Server } from 'node:http';
import cors, { CorsOptions } from 'cors';

import { injectable as Injectable, inject as Inject } from 'inversify';
import { json } from 'body-parser';
import { Mode } from './common/type';
import { TYPES } from './common/TYPES';
import { LoggerServiceInterface } from './logger/logger.interface';
import { ExceptionFilterInterface } from './errors/exception-filter.interface';
import { ConfigServiceInterface } from './config/config.interface';
import { MongooseServiceInterface } from './db/db.interface';
import { AuthMiddleware } from './common/auth.middleware';
import { UserControllerInterface } from './user/user.interface';

import passport from 'passport';

@Injectable()
export class App {
	app: Express;
	server: Server;
	port: number;
	isDev: boolean;

	constructor(
		@Inject(TYPES.LoggerInterface) private logger: LoggerServiceInterface,
		@Inject(TYPES.ExceptionFilterInterface)
		private exceptionFilter: ExceptionFilterInterface,
		@Inject(TYPES.ConfigServiceInterface)
		private configService: ConfigServiceInterface,
		@Inject(TYPES.MongooseServiceInterface)
		private mongooseService: MongooseServiceInterface,
		@Inject(TYPES.UserControllerInterface)
		private userController: UserControllerInterface,
	) {
		this.app = express();
		this.port = +this.configService.get('PORT') || 9999;
		this.isDev = this.configService.get('NODE_ENV') === Mode.DEVELOPMENT;
	}

	useRoutes(): void {
		this.app.use('/api/user', this.userController.router);
	}

	useExceptionFilters(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	useMiddleware(): void {
		const origins = this.configService.get('CORS_ORIGIN');
		const parsedOrigins = origins ? origins.split(',') : [];

		const corsOptions = {
			origin: function (origin: string, callback: Function): void {
				const trimmedOrigin = origin ? origin.trim() : null;
				if (!trimmedOrigin || parsedOrigins.indexOf(trimmedOrigin) !== -1) {
					callback(null, true);
				} else {
					callback(new Error('Not allowed by CORS'));
				}
			},
		};

		const authMiddleware = new AuthMiddleware(this.configService.get('SECRET'));
		this.app.use(authMiddleware.exec.bind(authMiddleware));

		this.app.use(cors(corsOptions as CorsOptions));
		this.app.use(json());

		this.app.use(passport.initialize());
	}

	public async init(): Promise<void> {
		this.useMiddleware();
		this.useRoutes();
		this.useExceptionFilters();

		await this.mongooseService.connect(this.isDev);
		const baseURL = this.configService.get('BASE_URL');

		this.server = this.app.listen(this.port, () => {
			const serverLink = this.isDev ? `${baseURL}:${this.port}` : baseURL;
			this.logger.log(`Server working => ${serverLink}`);
		});
	}
}

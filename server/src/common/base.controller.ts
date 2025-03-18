import 'reflect-metadata';

import { Router, type Response } from 'express';
import { LoggerService } from '../logger/logger.service';

import { injectable as Injectable } from 'inversify';

import {
	ControllerRouteInterface,
	ExpressReturnTypeInterface,
} from './base.interface';

@Injectable()
export abstract class BaseController {
	private readonly _router: Router;

	constructor(private logger: LoggerService) {
		this._router = Router();
	}

	get router(): Router {
		return this._router;
	}

	public send<T>(
		res: Response,
		code: number,
		message: T,
	): ExpressReturnTypeInterface {
		res.type('application/json');
		return res.status(code).json(message);
	}

	public ok<T>(res: Response, message: T): void {
		this.send<T>(res, 200, message);
	}

	public created(res: Response): ExpressReturnTypeInterface {
		return res.sendStatus(201);
	}

	protected bindRoutes(
		prefix: string,
		routes: ControllerRouteInterface[],
	): void {
		for (const route of routes) {
			this.logger.log(
				`[${route.method.toLocaleUpperCase()}] => /${prefix}${route.path}`,
			);

			const handler = route.func.bind(this);
			const middlewares = route.middlewares?.map((m) => m.exec.bind(m));

			const pipeline = middlewares ? [...middlewares, handler] : handler;
			this.router[route.method](route.path, pipeline);
		}
	}
}

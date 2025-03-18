import type { Request, Response, NextFunction, Router } from 'express';
import { MiddlewareInterface } from './middleware.interface';

export interface ControllerRouteInterface {
	path: string;
	func: (
		req: Request<any, {}, any, any>,
		res: Response,
		next: NextFunction,
	) => void;
	method: keyof Pick<Router, 'get' | 'post' | 'patch' | 'put' | 'delete'>;
	middlewares?: MiddlewareInterface[];
}

export type ExpressReturnTypeInterface = Response<any, Record<string, any>>;

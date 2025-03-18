import { NextFunction, Request, Response } from 'express';
import { HTTPError } from '../errors/http-error';
import { MiddlewareInterface } from './middleware.interface';

export class AuthGuard implements MiddlewareInterface {
	exec(req: Request, res: Response, next: NextFunction): void {
		if (req.authUser?.email) {
			next();
		} else {
			next(new HTTPError(401, 'Authorization error', 'AUTHORIZATION'));
		}
	}
}

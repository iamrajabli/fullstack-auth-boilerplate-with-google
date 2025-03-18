import { MiddlewareInterface } from './middleware.interface';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export class AuthMiddleware implements MiddlewareInterface {
	constructor(private secret: string) {}

	exec(req: Request, res: Response, next: NextFunction): void {
		if (req.headers.authorization) {
			const token = req.headers.authorization.split(' ')[1];

			verify(token, this.secret, (err, payload) => {
				if (err) {
					next();
				} else if (payload && typeof payload === 'object') {
					req.authUser = {
						email: payload.email,
						role: payload.role,
						_id: payload._id,
					};

					next();
				}
			});
		} else {
			next();
		}
	}
}

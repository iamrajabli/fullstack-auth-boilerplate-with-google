import { NextFunction, Request, Response } from 'express';
import { MiddlewareInterface } from './middleware.interface';
import { HTTPError } from '../errors/http-error';
import { UserRole } from '@/user/user.interface';

export class RoleGuard implements MiddlewareInterface {
	constructor(private readonly _role: UserRole) {}

	exec(req: Request, res: Response, next: NextFunction): void {
		if (req.authUser.role === this._role) {
			next();
		} else {
			next(new HTTPError(403, 'Forbidden Resource', 'ROLE AUTHORIZATION'));
		}
	}
}

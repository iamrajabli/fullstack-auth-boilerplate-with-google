import { HTTPError } from '@/errors/http-error';
import { NextFunction, Request, Response } from 'express';

export const handleRequest = (
	handler: (
		req: Request<any, any, any, any>,
		res: Response,
		next: NextFunction,
	) => Promise<void>,
) => {
	return async (
		req: Request<any, any, any, any>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			await handler(req, res, next);
		} catch (e) {
			if (e instanceof HTTPError) {
				next(new HTTPError(e.statusCode, e.message, e.context));
			} else {
				next(new HTTPError(500, e as string, 'GENERAL'));
			}
		}
	};
};

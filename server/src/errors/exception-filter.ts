import type { NextFunction, Request, Response } from 'express';
import { ExceptionFilterInterface } from './exception-filter.interface';

import { injectable as Injectable, inject as Inject } from 'inversify';
import 'reflect-metadata';
import { TYPES } from '@/common/TYPES';
import { LoggerServiceInterface } from '@/logger/logger.interface';
import { HTTPError } from './http-error';

@Injectable()
export class ExceptionFilter implements ExceptionFilterInterface {
	constructor(
		@Inject(TYPES.LoggerInterface) private logger: LoggerServiceInterface,
	) {}

	catch(
		err: Error | HTTPError,
		req: Request,
		res: Response,
		next: NextFunction,
	): void {
		if (err instanceof HTTPError) {
			this.logger.error(
				`[HTTP Error] => ${err.context ? `[${err.context}]` : ''} ${err.statusCode}: ${err.message}`,
			);
			res
				.status(err.statusCode)
				.send({ success: false, errors: [err.message] });
		} else {
			this.logger.error(`${err.message}`);
			res.status(500).send({ err: err.message });
		}
	}
}

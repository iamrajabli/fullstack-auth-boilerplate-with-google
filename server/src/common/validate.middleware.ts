import { NextFunction, Request, Response } from 'express';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MiddlewareInterface } from './middleware.interface';

export class ValidateMiddleware implements MiddlewareInterface {
	constructor(private classToValidate: ClassConstructor<object>) {}

	exec(req: Request, res: Response, next: NextFunction): void {
		const instance = plainToInstance(this.classToValidate, req.body);

		validate(instance).then((errors) => {
			if (errors.length > 0) {
				const errorsObject: Record<string, string[]> = {};

				errors.forEach((err) => {
					if (err.children?.length === 0) {
						errorsObject[err.property] = Object.values(err.constraints!);
					} else {
						err.children?.forEach((e) => {
							errorsObject[e.property] = Object.values(e.constraints!);
						});
					}
				});

				res.status(422).send({ errors: errorsObject });
			} else {
				next();
			}
		});
	}
}

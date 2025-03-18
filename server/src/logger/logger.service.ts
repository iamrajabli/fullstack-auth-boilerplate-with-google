import 'reflect-metadata';
import { Logger, ILogObj, ISettingsParam } from 'tslog';

import { injectable as Injectable } from 'inversify';
import { LoggerServiceInterface } from './logger.interface';

@Injectable()
export class LoggerService implements LoggerServiceInterface {
	logger: Logger<ISettingsParam<ILogObj>>;

	constructor() {
		this.logger = new Logger();
	}

	log(...args: unknown[]): void {
		this.logger.info(...args);
	}

	error(...args: unknown[]): void {
		this.logger.error(...args);
	}

	warn(...args: unknown[]): void {
		this.logger.warn(...args);
	}
}

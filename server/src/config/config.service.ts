import { injectable as Injectable, inject as Inject } from 'inversify';
import { config, DotenvParseOutput } from 'dotenv';
import { TYPES } from '@/common/TYPES';
import { ConfigServiceInterface } from './config.interface';
import { LoggerServiceInterface } from '@/logger/logger.interface';

@Injectable()
export class ConfigService implements ConfigServiceInterface {
	private readonly config: DotenvParseOutput;

	constructor(
		@Inject(TYPES.LoggerInterface) private logger: LoggerServiceInterface,
	) {
		const result = config();

		if (result.error) {
			this.logger.error('[ConfigService] dotenv parse error.');
		} else {
			this.logger.log('[ConfigService] successfully parsed.');
			this.config = result.parsed as DotenvParseOutput;
		}
	}

	get(key: string): string {
		return this.config[key];
	}
}

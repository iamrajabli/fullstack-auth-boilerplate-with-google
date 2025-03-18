import { inject as Inject, injectable as Injectable } from 'inversify';
import mongoose, { Model, Schema } from 'mongoose';
import { MongooseServiceInterface } from './db.interface';
import { TYPES } from '@/common/TYPES';
import { LoggerServiceInterface } from '@/logger/logger.interface';
import { ConfigServiceInterface } from '@/config/config.interface';

@Injectable()
export class MongooseService implements MongooseServiceInterface {
	constructor(
		@Inject(TYPES.LoggerInterface)
		private loggerService: LoggerServiceInterface,
		@Inject(TYPES.ConfigServiceInterface)
		private configService: ConfigServiceInterface,
	) {}

	async connect(isDev: boolean): Promise<void> {
		try {
			await mongoose.connect(this.configService.get('DATABASE_URL'), {});
			this.loggerService.log('[MongooseService] DB Connection successfully.');

			if (isDev) {
				mongoose.set('debug', true);
			}
		} catch (e) {
			if (e instanceof Error) {
				this.loggerService.error(
					'[MongooseService] DB Connection failed.',
					e.message,
				);
			}
		}
	}

	async disconnect(): Promise<void> {
		await mongoose.disconnect();
	}

	async model<T extends Document>(
		name: string,
		schema: Schema,
	): Promise<Model<T>> {
		return mongoose.model<T>(name, schema);
	}
}

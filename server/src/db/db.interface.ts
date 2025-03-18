import { Model, Schema } from 'mongoose';

export interface MongooseServiceInterface {
	connect(isDev: boolean): Promise<void>;

	disconnect(): Promise<void>;

	model<T extends Document>(name: string, schema: Schema): Promise<Model<T>>;
}

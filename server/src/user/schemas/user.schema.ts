import mongoose, { Schema } from 'mongoose';
import shortId from 'shortid';
import { UserDocument, UserRole } from '../user.interface';

const UserSchema: Schema = new Schema<UserDocument>(
	{
		_id: {
			type: String,
			default: shortId.generate,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: UserRole,
			default: UserRole.USER,
		},
		phone: {
			type: String,
		},
		deleted: {
			type: Boolean,
			default: false,
		},
		phoneConfirmed: {
			type: Boolean,
			default: false,
		},
		provider: {
			type: String,
			enum: ['email', 'google'],
			default: 'email',
		},
	},
	{ timestamps: true, versionKey: false },
);

const UserModel = mongoose.model<UserDocument>('User', UserSchema);

export { UserModel };

import { injectable as Injectable, inject as Inject } from 'inversify';
import { UserDocument, UserRole, UserServiceInterface } from './user.interface';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserModel } from './schemas/user.schema';
import { HTTPError } from '@/errors/http-error';
import { hash, compare } from 'bcryptjs';
import { TYPES } from '@/common/TYPES';
import { ConfigServiceInterface } from '@/config/config.interface';
import { sign, verify } from 'jsonwebtoken';
import { UserLoginDto } from './dto/user-login.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserUpdatePasswordDto } from './dto/user-update-password.dto';
import { UserResetPasswordDto } from './dto/user-reset-password.dto';
import { UserForgotPasswordDto } from './dto/user-forgot-password.dto';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { UserGoogleLoginDto } from './dto/user-google-login.dto';
import passport from 'passport';

// It would be more accurate to import validation messages from constant file.
// But it is not implemented in the provided codebase.
@Injectable()
export class UserService implements UserServiceInterface {
	constructor(
		@Inject(TYPES.ConfigServiceInterface)
		private configService: ConfigServiceInterface,
	) {}

	async createUser({
		email,
		name,
		password,
		phone,
		provider,
	}: UserRegisterDto): Promise<UserDocument | null> {
		const [existedUserByEmail, existedUserByPhone] = await Promise.all([
			await UserModel.findOne({ email }),
			await UserModel.findOne({ phone }),
		]);

		if (existedUserByEmail) throw new HTTPError(400, 'Existing email');
		if (existedUserByPhone) throw new HTTPError(400, 'Existing phone');

		const salt = +this.configService.get('SALT');
		const hashedPassword = await hash(password, salt);

		return UserModel.create({
			name,
			email,
			phone,
			provider,
			password: hashedPassword,
		});
	}

	async updateUser(
		id: string,
		{ name, phone }: UserUpdateDto,
	): Promise<UserDocument | null> {
		const user = await UserModel.findById(id);

		if (!user) throw new HTTPError(404, 'User not found', 'UPDATE USER');

		if (phone) {
			const existedUserByPhone = await UserModel.findOne({ phone });

			if (existedUserByPhone)
				throw new HTTPError(400, 'Existing phone', 'UPDATE USER');
		}

		user.name = name ?? user.name;
		user.phone = phone ?? user.phone;

		await user.save();

		return user;
	}

	async updatePassword(
		id: string,
		{ password, newPassword }: UserUpdatePasswordDto,
	): Promise<UserDocument | null> {
		const user = await UserModel.findById(id);

		if (!user) throw new HTTPError(404, 'User not found', 'UPDATE PASSWORD');

		const isCorrectPass = await compare(password, user.password);

		if (!isCorrectPass)
			throw new HTTPError(400, 'Incorrect password', 'UPDATE PASSWORD');

		const salt = +this.configService.get('SALT');

		user.password = await hash(newPassword, salt);

		await user.save();

		return user;
	}

	async signJWT(
		email: string,
		role: UserRole,
		id: string,
		secret: string,
	): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					role,
					_id: id,
				},
				secret,
				{
					algorithm: 'HS256',
				},
				(err, token) => {
					if (err) {
						reject(err);
					}

					resolve(token as string);
				},
			);
		});
	}

	async validateUser({
		email,
		password,
	}: UserLoginDto): Promise<UserDocument | null> {
		const existedUser = await UserModel.findOne({ email });

		if (!existedUser)
			throw new HTTPError(404, 'User not found', 'VALIDATE USER');

		const isCorrectPass = await compare(password, existedUser.password);

		if (!isCorrectPass)
			throw new HTTPError(
				401,
				'Email or password is incorrect',
				'VALIDATE USER',
			);

		return existedUser;
	}

	async getCurrentUser(email: string): Promise<UserDocument | null> {
		const user = await UserModel.findOne({ email });

		if (!user) throw new HTTPError(404, 'User not found', 'VALIDATE USER');

		return user;
	}

	async resetPassword({
		token,
		password,
	}: UserResetPasswordDto): Promise<{ _id: string } | null> {
		const secret = this.configService.get('SECRET') as string;

		let decoded;
		try {
			decoded = verify(token, secret) as { _id: string };
		} catch (err) {
			throw new HTTPError(422, 'Incorrect or expired token', 'RESET PASSWORD');
		}

		const user = await UserModel.findById(decoded._id);
		if (!user) throw new HTTPError(404, 'User not found', 'RESET PASSWORD');

		const hashedPassword = await hash(password, 10);

		user.password = hashedPassword;
		await user.save();

		return { _id: user._id };
	}

	async forgotPassword({
		email,
	}: UserForgotPasswordDto): Promise<{ resetUrl: string } | null> {
		const user = await UserModel.findOne({ email });

		if (!user) throw new HTTPError(404, 'User not found', 'FORGOT PASSWORD');

		const secret = this.configService.get('SECRET') as string;
		const frontendUrl = this.configService.get('FRONTEND_URL') as string;

		const token = sign({ _id: user._id }, secret, {
			expiresIn: '1h',
		});

		const resetUrl = `${frontendUrl}?resetPassword=open&token=${token}`;

		// connect your email service and send the reset URL
		return { resetUrl };
	}

	async setupGoogleAuth(): Promise<void> {
		const clientID = this.configService.get('GOOGLE_CLIENT_ID') as string;
		const clientSecret = this.configService.get(
			'GOOGLE_CLIENT_SECRET',
		) as string;
		const callbackURL = this.configService.get('GOOGLE_CALLBACK_URL') as string;

		passport.use(
			new GoogleStrategy(
				{
					clientID,
					clientSecret,
					callbackURL,
					scope: ['profile', 'email'],
				},
				async (accessToken, refreshToken, profile, done) => {
					try {
						const email = profile.emails?.[0]?.value;
						let user = await UserModel.findOne({ email });

						if (!user) {
							const salt = +this.configService.get('SALT');
							const randomPassword = await hash(profile.id, salt); // Hash the Google profile ID

							user = await UserModel.create({
								email,
								name: profile.displayName,
								provider: 'google',
								password: randomPassword, // Store hashed password
							});
						}

						return done(null, user);
					} catch (error) {
						return done(error, undefined);
					}
				},
			),
		);
	}

	async googleLogin(dto: UserGoogleLoginDto): Promise<UserDocument | null> {
		const existedUser = await UserModel.findOne({ email: dto.email });

		if (!existedUser)
			throw new HTTPError(404, 'User not found', 'GOOGLE LOGIN');

		return existedUser;
	}
}

import { BaseController } from '@/common/base.controller';
import { TYPES } from '@/common/TYPES';
import { LoggerServiceInterface } from '@/logger/logger.interface';
import { inject as Inject, injectable as Injectable } from 'inversify';
import { NextFunction, Request, Response } from 'express';
import {
	UserControllerInterface,
	UserDocument,
	UserRole,
	UserServiceInterface,
} from './user.interface';
import { UserRegisterDto } from './dto/user-register.dto';
import { ValidateMiddleware } from '@/common/validate.middleware';
import { HTTPError } from '@/errors/http-error';
import { createReturnData } from '@/utils/getData';
import { ConfigServiceInterface } from '@/config/config.interface';
import { UserLoginDto } from './dto/user-login.dto';
import { handleRequest } from '@/utils/handleRequest';
import { RequestUser } from '@/custom';
import { AuthGuard } from '@/common/auth.guard';
import { RoleGuard } from '@/common/role.guard';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserUpdatePasswordDto } from './dto/user-update-password.dto';
import { UserForgotPasswordDto } from './dto/user-forgot-password.dto';
import { UserResetPasswordDto } from './dto/user-reset-password.dto';
import passport from 'passport';

// It would be more accurate to import validation messages from constant file.
// But it is not implemented in the provided codebase.
@Injectable()
export class UserController
	extends BaseController
	implements UserControllerInterface
{
	constructor(
		@Inject(TYPES.LoggerInterface)
		private readonly loggerService: LoggerServiceInterface,
		@Inject(TYPES.UserServiceInterface)
		private readonly userService: UserServiceInterface,
		@Inject(TYPES.ConfigServiceInterface)
		private configService: ConfigServiceInterface,
	) {
		super(loggerService);

		this.bindRoutes('user', [
			{
				path: '/register',
				method: 'post',
				func: this.register,
				middlewares: [new ValidateMiddleware(UserRegisterDto)],
			},
			{
				path: '/login',
				method: 'post',
				func: this.login,
				middlewares: [new ValidateMiddleware(UserLoginDto)],
			},
			{
				path: '/',
				method: 'put',
				func: this.updateUser,
				middlewares: [new ValidateMiddleware(UserUpdateDto)],
			},
			{
				path: '/password',
				method: 'put',
				func: this.updatePassword,
				middlewares: [new ValidateMiddleware(UserUpdatePasswordDto)],
			},
			{
				path: '/admin-login',
				method: 'post',
				func: this.login,
				middlewares: [
					new ValidateMiddleware(UserLoginDto),
					new RoleGuard(UserRole.ADMIN),
				],
			},
			{
				path: '/forgot-password',
				method: 'post',
				func: this.forgotPassword,
				middlewares: [new ValidateMiddleware(UserForgotPasswordDto)],
			},
			{
				path: '/reset-password',
				method: 'put',
				func: this.resetPassword,
				middlewares: [new ValidateMiddleware(UserResetPasswordDto)],
			},
			{
				path: '/me',
				method: 'get',
				func: this.currentUser,
				middlewares: [new AuthGuard()],
			},

			{
				path: '/google',
				method: 'get',
				func: this.googleAuth,
			},
			{
				path: '/google/callback',
				method: 'get',
				func: this.googleAuthCallback,
			},
		]);

		// 🚀 Init Google Strategy
		this.userService.setupGoogleAuth();
	}

	// 🚀 Redirect user to Google login page
	googleAuth = handleRequest(
		async (req: Request, res: Response, next: NextFunction) => {
			passport.authenticate('google', { scope: ['profile', 'email'] })(
				req,
				res,
				next,
			);
		},
	);

	// 🚀 Handle Google callback and send JWT to frontend
	googleAuthCallback = handleRequest(async (req: Request, res: Response) => {
		passport.authenticate(
			'google',
			{ session: false },
			async (err, user: UserDocument, info) => {
				if (err || !user) {
					throw new HTTPError(400, 'Google Login failed', 'GOOGLE LOGIN');
				}

				// Extract token from the authenticated user

				const secret = this.configService.get('SECRET');

				const token = await this.userService.signJWT(
					user.email,
					user.role,
					user._id,
					secret,
				);

				// Redirect user to frontend with the token
				res.redirect(
					`${this.configService.get('FRONTEND_URL')}/auto-login?token=${token}`,
				);
			},
		)(req, res);
	});

	register = handleRequest(
		async (req: Request<{}, {}, UserRegisterDto>, res: Response) => {
			const user = await this.userService.createUser(req.body);

			if (!user) {
				throw new HTTPError(400, 'Register error', 'CREATE USER');
			}

			const { email, role, _id, name, phone } = user;

			const secret = this.configService.get('SECRET');
			const token = await this.userService.signJWT(email, role, _id, secret);

			this.ok(
				res,
				createReturnData<{
					email: string;
					name: string;
					phone: string;
					token: string;
				}>({
					email,
					name,
					phone,
					token,
				}),
			);
		},
	);

	login = handleRequest(
		async (req: Request<{}, {}, UserLoginDto>, res: Response) => {
			const user = await this.userService.validateUser(req.body);

			if (!user) {
				throw new HTTPError(400, 'Login error', 'LOGIN USER');
			}

			const { email, role, _id, name, phone, deleted } = user;

			if (deleted) {
				throw new HTTPError(403, 'User removed', 'LOGIN USER');
			}

			const secret = this.configService.get('SECRET');

			const token = await this.userService.signJWT(email, role, _id, secret);

			this.ok(
				res,
				createReturnData<{
					email: string;
					name: string;
					phone: string;
					token: string;
				}>({
					email,
					name,
					phone,
					token,
				}),
			);
		},
	);

	updateUser = handleRequest(
		async (req: Request<{}, {}, UserUpdateDto>, res: Response) => {
			const {
				body,
				authUser: { _id },
			} = req;

			const updatedUser = await this.userService.updateUser(_id, body);

			if (!updatedUser) {
				throw new HTTPError(400, 'User is not updated', 'CREATE USER');
			}

			const { email, role, name, phone } = updatedUser;

			const secret = this.configService.get('SECRET');
			const token = await this.userService.signJWT(email, role, _id, secret);

			this.ok(
				res,
				createReturnData<{
					email: string;
					name: string;
					phone: string;
					token: string;
				}>({
					email,
					name,
					phone,
					token,
				}),
			);
		},
	);

	updatePassword = handleRequest(
		async (req: Request<{}, {}, UserUpdatePasswordDto>, res: Response) => {
			const {
				body,
				authUser: { _id },
			} = req;

			const user = await this.userService.updatePassword(_id, body);

			if (!user) {
				throw new HTTPError(400, 'User pass is not updated', 'CREATE USER');
			}

			const { email, role, name, phone } = user;

			const secret = this.configService.get('SECRET');
			const token = await this.userService.signJWT(email, role, _id, secret);

			this.ok(
				res,
				createReturnData<{
					email: string;
					name: string;
					phone: string;
					token: string;
				}>({
					email,
					name,
					phone,
					token,
				}),
			);
		},
	);

	forgotPassword = handleRequest(
		async (req: Request<{}, {}, UserForgotPasswordDto>, res: Response) => {
			const { body } = req;

			const data = await this.userService.forgotPassword(body);

			if (!data) {
				throw new HTTPError(
					400,
					'Password reset link sent',
					'FORGOT PASS USER',
				);
			}

			const { resetUrl } = data;
			this.loggerService.warn('resetUrl', resetUrl);
			this.ok(
				res,
				createReturnData<{
					resetUrl: string;
				}>({
					resetUrl,
				}),
			);
		},
	);

	resetPassword = handleRequest(
		async (req: Request<{}, {}, UserResetPasswordDto>, res: Response) => {
			const { body } = req;

			const data = await this.userService.resetPassword(body);

			if (!data) {
				throw new HTTPError(400, 'Reset password error', 'FORGOT PASS USER');
			}

			const { _id } = data;

			this.ok(
				res,
				createReturnData<{
					_id: string;
				}>({
					_id,
				}),
			);
		},
	);

	currentUser = handleRequest(
		async (req: Request<{}, RequestUser>, res: Response) => {
			const authorizedUser = await this.userService.getCurrentUser(
				req.authUser.email,
			);

			if (!authorizedUser) {
				throw new HTTPError(401, 'Authorization error', 'CURRENT USER');
			}

			const { email, name, phone, _id, role } = authorizedUser;

			this.ok(
				res,
				createReturnData<{
					_id: string;
					email: string;
					name: string;
					phone: string;
					role: UserRole;
				}>({
					_id,
					email,
					name,
					phone,
					role,
				}),
			);
		},
	);
}

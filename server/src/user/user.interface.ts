import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { NextFunction, Request, Response, Router } from 'express';
import { UserUpdatePasswordDto } from './dto/user-update-password.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserForgotPasswordDto } from './dto/user-forgot-password.dto';
import { UserResetPasswordDto } from './dto/user-reset-password.dto';
import { UserGoogleLoginDto } from './dto/user-google-login.dto';

export enum UserRole {
	ADMIN = 'ADMIN',
	USER = 'USER',
	MODERATOR = 'MODERATOR',
}

export interface UserDocument extends Document {
	_id: string;
	email: string;
	name: string;
	phone: string;
	phoneConfirmed: boolean;
	password: string;
	role: UserRole;
	deleted: boolean;
	provider: 'email' | 'google';
}

export interface UserControllerInterface {
	router: Router;
	register(
		req: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	login(
		req: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	currentUser(req: Request, res: Response, next: NextFunction): Promise<void>;
	updatePassword(
		req: Request<{}, {}, UserUpdatePasswordDto>,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	updateUser(
		req: Request<{}, {}, UserUpdateDto>,
		res: Response,
		next: NextFunction,
	): Promise<void>;
	forgotPassword: (
		req: Request<{}, {}, UserForgotPasswordDto>,
		res: Response,
		next: NextFunction,
	) => void;
	resetPassword: (
		req: Request<{}, {}, UserResetPasswordDto>,
		res: Response,
		next: NextFunction,
	) => void;
}

export interface UserServiceInterface {
	createUser(dto: UserRegisterDto): Promise<UserDocument | null>;
	getCurrentUser(email: string): Promise<UserDocument | null>;
	signJWT(
		email: string,
		role: UserRole,
		id: string,
		secret: string,
	): Promise<string>;
	validateUser(dto: UserLoginDto): Promise<UserDocument | null>;
	updatePassword(
		userId: string,
		dto: UserUpdatePasswordDto,
	): Promise<UserDocument | null>;
	updateUser(userId: string, dto: UserUpdateDto): Promise<UserDocument | null>;
	resetPassword(dto: UserResetPasswordDto): Promise<{ _id: string } | null>;
	forgotPassword(
		dto: UserForgotPasswordDto,
	): Promise<{ resetUrl: string } | null>;

	setupGoogleAuth(): Promise<void>;
	googleLogin(dto: UserGoogleLoginDto): Promise<UserDocument | null>;
}

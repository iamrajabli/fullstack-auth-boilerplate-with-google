import { IsString } from 'class-validator';

export class UserResetPasswordDto {
	@IsString({
		message: 'password',
	})
	password: string;

	@IsString({
		message: 'token',
	})
	token: string;
}

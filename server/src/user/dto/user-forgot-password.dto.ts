import { IsString } from 'class-validator';

export class UserForgotPasswordDto {
	@IsString({
		message: 'email',
	})
	email: string;
}

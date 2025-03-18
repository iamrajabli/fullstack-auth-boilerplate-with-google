import { IsString } from 'class-validator';

export class UserUpdatePasswordDto {
	@IsString({
		message: 'password',
	})
	password: string;

	@IsString({
		message: 'new password',
	})
	newPassword: string;
}

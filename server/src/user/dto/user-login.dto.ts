import { IsEmail, IsString } from 'class-validator';

export class UserLoginDto {
	@IsEmail(
		{},
		{
			message: 'email',
		},
	)
	email: string;

	@IsString({
		message: 'password',
	})
	password: string;
}

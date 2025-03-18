import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserGoogleLoginDto {
	@IsEmail({}, { message: 'Email' })
	email: string;

	@IsString({ message: 'Name' })
	name: string;

	@IsString({ message: 'googleId' })
	googleId: string;
}

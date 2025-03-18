import {
	IsEmail,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';
import { UserRole } from '../user.interface';

export class UserRegisterDto {
	@IsEmail({}, { message: 'email' })
	email: string;

	@IsString({ message: 'phone' })
	phone: string;

	@IsString({ message: 'pass' })
	@MinLength(6, {
		message: 'min length 6',
	})
	password: string;

	@IsString({ message: 'ad' })
	name: string;

	@IsOptional()
	@IsEnum(['google', 'basic'], {
		message: 'provider',
	})
	provider: UserRole;
}

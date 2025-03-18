import { IsString } from 'class-validator';

export class UserUpdateDto {
	@IsString({
		message: 'name',
	})
	name: string;

	@IsString({
		message: 'phone',
	})
	phone: string;
}

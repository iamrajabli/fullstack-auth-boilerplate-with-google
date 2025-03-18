import { PaginationReturnType } from '@/utils/pagination';
import { IsNotEmpty, IsString } from 'class-validator';

export enum Mode {
	DEVELOPMENT = 'development',
	PRODUCTION = 'production',
	TESTING = 'testing',
}

export type DataWithPagination<TDocument> = {
	documents: TDocument[];
	pagination: PaginationReturnType['pagination'];
};

export type LabelValue = {
	label: string;
	value: string;
};

export class LabelValueDto {
	@IsString({ message: 'Label must be a string' })
	@IsNotEmpty({ message: 'Label cannot be empty' })
	label: string;

	@IsString({ message: 'Value must be a string' })
	@IsNotEmpty({ message: 'Value cannot be empty' })
	value: string;
}

import { PaginationReturnType } from './pagination';

export function createReturnData<T>(
	data: T,
	pagination?: PaginationReturnType['pagination'],
): {
	success: boolean;
	data: T;
	pagination?: PaginationReturnType['pagination'];
} {
	return {
		success: true,
		data,
		...(pagination && { pagination }),
	};
}

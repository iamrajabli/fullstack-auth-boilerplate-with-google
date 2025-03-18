import { SortOptionsType } from './sort';

export type PaginationReturnType = {
	pagination: {
		totalData: number;
		totalPage: number;
		currentPage: number;
		nextPage: number | null;
		prevPage: number | null;
	};
};

export type PaginationAndSearchType = {
	limit: number;
	page: number;
	search: string;
	sort: SortOptionsType;
};

export function getPaginationData(
	total: number,
	page: number,
	limit: number,
): PaginationReturnType {
	const totalPage = Math.ceil(total / limit);
	const isNotData = +total === 0;

	const nextPage = +page === totalPage || isNotData ? null : +page + 1;
	const prevPage = +page === 1 || isNotData ? null : +page - 1;

	return {
		pagination: {
			totalData: total,
			totalPage,
			currentPage: +page,
			nextPage,
			prevPage,
		},
	};
}

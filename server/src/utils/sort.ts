export const sortOptions = {
	created_desc: { createdAt: -1 },
	created_asc: { createdAt: 1 },
};

export type SortOptionsType = keyof typeof sortOptions;

export function getSortCriteria(
	sort: keyof typeof sortOptions,
): typeof sortCriteria {
	const sortCriteria =
		sortOptions[sort as keyof typeof sortOptions] ?? sortOptions.created_desc;

	return sortCriteria;
}

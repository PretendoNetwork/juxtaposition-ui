declare module 'mongoose-fuzzy-search-next' {

	import { FilterQuery } from 'mongoose';

	export function FuzzySearch<T>(fields: string[], searchKey: string): FilterQuery<T>
}

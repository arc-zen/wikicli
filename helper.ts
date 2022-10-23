// deno-lint-ignore-file
// deno-lint-ignore ban-types
export function replaceInStringWithColor(string: string, replace: RegExp | string, replaceWith: Function): string {
	const strings = string.match(replace);
	if (strings === null) return string;
	for (const str of strings) {
		string = string.replace(str, replaceWith(str));
	}
	return string;
}
/**
 * Index of Multidimensional Array
 * @param arr {!Array} - the input array
 * @param k {object} - the value to search
 * @return {Array}
 */
export function getIndexOfK(arr: Array<any>, k: object) {
	for (let i = 0; i < arr.length; i++) {
		const index = arr[i].indexOf(k);
		if (index > -1) {
			return [i, index];
		}
	}
}

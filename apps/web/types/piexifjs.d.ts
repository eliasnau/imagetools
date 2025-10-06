declare module "piexifjs" {
	interface ExifObject {
		[key: string]: any;
	}
	export const ImageIFD: {
		Orientation: number;
		Software: number;
		[key: string]: number;
	};
	export function load(data: string): ExifObject;
	export function remove(data: string): string;
	export function dump(obj: ExifObject): string;
	export function insert(exifBytes: string, jpegData: string): string;
}

export interface ImageFormatSpec {
	mime: string;
	name: string;
	extension: string;
	description: string;
	lossy: boolean;
	supportsAlpha: boolean;
}

export const IMAGE_FORMATS: ImageFormatSpec[] = [
	{
		mime: "image/webp",
		name: "WebP",
		extension: "webp",
		description: "Modern lossy/lossless format with good compression balance.",
		lossy: true,
		supportsAlpha: true,
	},
	{
		mime: "image/avif",
		name: "AVIF",
		extension: "avif",
		description: "Next‑gen codec with very high compression efficiency.",
		lossy: true,
		supportsAlpha: true,
	},
	{
		mime: "image/png",
		name: "PNG",
		extension: "png",
		description: "Lossless format supporting transparency.",
		lossy: false,
		supportsAlpha: true,
	},
	{
		mime: "image/jpeg",
		name: "JPEG",
		extension: "jpg",
		description: "Widely supported lossy photographic format.",
		lossy: true,
		supportsAlpha: false,
	},
	{
		mime: "image/x-icon",
		name: "ICO",
		extension: "ico",
		description: "Multi-resolution icon container (favicons).",
		lossy: false,
		supportsAlpha: true,
	},
];

export const IMAGE_FORMATS_BY_MIME: Record<string, ImageFormatSpec> =
	Object.fromEntries(IMAGE_FORMATS.map((f) => [f.mime, f]));

export function listOutputMimes(): string[] {
	return IMAGE_FORMATS.map((f) => f.mime);
}

export function isLossy(mime: string): boolean {
	return !!IMAGE_FORMATS_BY_MIME[mime]?.lossy;
}

export function extensionFor(mime: string): string | undefined {
	return IMAGE_FORMATS_BY_MIME[mime]?.extension;
}

export function formatName(mime: string): string {
	return IMAGE_FORMATS_BY_MIME[mime]?.name || mime;
}

export function supportsAlpha(mime: string): boolean {
	return !!IMAGE_FORMATS_BY_MIME[mime]?.supportsAlpha;
}

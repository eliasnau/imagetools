"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { ImageDropzone } from "@/components/image-dropzone";
import { PreviewOutput } from "@/components/preview-output";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { toast } from "sonner";

interface MetaEntry {
	key: string;
	value: string;
}
interface MetaCategories {
	overview: MetaEntry[];
	camera: MetaEntry[];
	capture: MetaEntry[];
	location: MetaEntry[];
	software: MetaEntry[];
	color: MetaEntry[];
	other: MetaEntry[];
}

function formatNumber(n: any, digits = 2) {
	if (n == null || isNaN(Number(n))) return "";
	return Number(n).toFixed(digits).replace(/\.00$/, "");
}

function formatExposure(t?: number | string) {
	if (!t) return "";
	const num = typeof t === "string" ? parseFloat(t) : t;
	if (!num || num <= 0) return "";
	if (num >= 1) return num.toFixed(2) + " s";
	const denom = Math.round(1 / num);
	return `1/${denom}`;
}

function formatDate(raw?: string | Date) {
	if (!raw) return "";
	try {
		const d = raw instanceof Date ? raw : new Date(raw);
		if (isNaN(d.getTime())) return "";
		return d.toLocaleString();
	} catch {
		return "";
	}
}

function dmsToDecimal(dms: number[] | undefined, ref?: string) {
	if (!dms || dms.length !== 3) return null;
	const [deg, min, sec] = dms.map(Number);
	if ([deg, min, sec].some(isNaN)) return null;
	let dec = deg + min / 60 + sec / 3600;
	if (ref && /[SW]/i.test(ref)) dec *= -1;
	return dec;
}

export default function MetadataToolPage() {
	const [file, setFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [baseName, setBaseName] = useState("metadata");
	const [loading, setLoading] = useState(false);
	const [stripAll, setStripAll] = useState(false);
	const [result, setResult] = useState<{
		url: string;
		mime: string;
		size: number;
		width: number;
		height: number;
	} | null>(null);
	const [categories, setCategories] = useState<MetaCategories | null>(null);
	const [metaApprox, setMetaApprox] = useState<{
		bytes: number;
		pct: number;
	} | null>(null);

	const [stripAllCategories, setStripAllCategories] = useState(false);
	const [stripCategories, setStripCategories] = useState({
		camera: false,
		capture: false,
		location: false,
		software: false,
		color: false,
		other: false,
		orientation: false,
		xmp: false,
		icc: false,
	});

	const buildCategories = useCallback(
		(
			file: File,
			img: HTMLImageElement,
			exif: any | null,
			scanInfo: { icc?: boolean } = {},
		) => {
			const overview: MetaEntry[] = [
				{ key: "Name", value: file.name },
				{
					key: "File size",
					value: `${(file.size / 1024 / 1024).toFixed(2)} MB (${file.size} bytes)`,
				},
				{
					key: "File type",
					value: (file.name.split(".").pop() || "").toUpperCase(),
				},
				{ key: "MIME type", value: file.type || "" },
				{
					key: "Image size",
					value: `${img.width} x ${img.height} (${((img.width * img.height) / 1_000_000).toFixed(1)} megapixels)`,
				},
				{
					key: "Color space",
					value: exif?.ColorSpace || exif?.colorSpace || "",
				},
				{
					key: "Created",
					value: formatDate(exif?.DateTimeOriginal || exif?.CreateDate),
				},
			];

			const camera: MetaEntry[] = [
				{ key: "Make", value: exif?.Make || "" },
				{ key: "Model", value: exif?.Model || "" },
				{ key: "Lens", value: exif?.LensModel || exif?.LensID || "" },
				{
					key: "Focal length",
					value: exif?.FocalLength
						? `${formatNumber(exif.FocalLength, 2)} mm`
						: "",
				},
				{
					key: "Aperture",
					value: exif?.FNumber
						? formatNumber(exif.FNumber, 1)
						: exif?.ApertureValue
							? formatNumber(exif.ApertureValue, 1)
							: "",
				},
				{ key: "ISO", value: exif?.ISO ? String(exif.ISO) : "" },
			];

			const capture: MetaEntry[] = [
				{
					key: "Exposure",
					value: exif?.ExposureTime ? formatExposure(exif.ExposureTime) : "",
				},
				{
					key: "Shutter speed",
					value: exif?.ShutterSpeedValue
						? formatNumber(exif.ShutterSpeedValue, 2)
						: "",
				},
				{ key: "Exposure program", value: exif?.ExposureProgram || "" },
				{
					key: "White balance",
					value:
						exif?.WhiteBalance != null
							? exif.WhiteBalance === 0
								? "Auto"
								: "Manual"
							: "",
				},
				{
					key: "Flash",
					value:
						exif?.Flash != null
							? exif.Flash
								? "Flash Fired"
								: "Off, Did not fire"
							: "",
				},
				{
					key: "Orientation",
					value: exif?.Orientation ? String(exif.Orientation) : "",
				},
			];

			const gpsLat = exif?.GPSLatitude;
			const gpsLon = exif?.GPSLongitude;
			const gpsLatRef = exif?.GPSLatitudeRef;
			const gpsLonRef = exif?.GPSLongitudeRef;

			let latDec: number | null = null;
			let lonDec: number | null = null;

			if (Array.isArray(gpsLat))
				latDec = dmsToDecimal(gpsLat, gpsLatRef) ?? null;
			else if (typeof gpsLat === "number") latDec = gpsLat;
			if (Array.isArray(gpsLon))
				lonDec = dmsToDecimal(gpsLon, gpsLonRef) ?? null;
			else if (typeof gpsLon === "number") lonDec = gpsLon;

			const dmsFormat = (val: number[] | undefined, ref?: string) => {
				if (!val || val.length !== 3) return "";
				return `${val[0]}° ${val[1]}' ${val[2].toFixed(2)}" ${ref || ""}`.trim();
			};

			const location: MetaEntry[] = [
				{
					key: "Latitude",
					value: Array.isArray(gpsLat)
						? dmsFormat(gpsLat, gpsLatRef)
						: latDec != null
							? latDec.toFixed(6)
							: "",
				},
				{
					key: "Longitude",
					value: Array.isArray(gpsLon)
						? dmsFormat(gpsLon, gpsLonRef)
						: lonDec != null
							? lonDec.toFixed(6)
							: "",
				},
				{
					key: "Altitude",
					value:
						exif?.GPSAltitude != null
							? `${formatNumber(exif.GPSAltitude, 1)} m`
							: "",
				},
				{
					key: "Direction",
					value:
						exif?.GPSImgDirection != null
							? `${formatNumber(exif.GPSImgDirection, 1)}° ${exif?.GPSImgDirectionRef || ""}`.trim()
							: "",
				},
				{
					key: "Speed",
					value:
						exif?.GPSSpeed != null
							? `${formatNumber(exif.GPSSpeed, 1)} ${exif?.GPSSpeedRef || ""}`
							: "",
				},
				{
					key: "Timestamp",
					value: exif?.GPSDateTime || exif?.GPSTimeStamp || "",
				},
				{
					key: "Position Accuracy",
					value:
						exif?.GPSHPositioningError != null
							? `${formatNumber(exif.GPSHPositioningError, 1)} m`
							: "",
				},
			];

			const software: MetaEntry[] = [
				{ key: "Software", value: exif?.Software || exif?.CreatorTool || "" },
				{ key: "Host Computer", value: exif?.HostComputer || "" },
				{
					key: "RunTime Flags",
					value: exif?.RunTimeFlags != null ? String(exif.RunTimeFlags) : "",
				},
			];

			const color: MetaEntry[] = [
				{ key: "ICC Profile", value: scanInfo.icc ? "Present" : "" },
				{
					key: "Bit Depth",
					value: exif?.BitsPerSample
						? String(exif.BitsPerSample)
						: exif?.BitDepth
							? String(exif.BitDepth)
							: "",
				},
				{
					key: "Color Space Data",
					value: exif?.ColorSpaceData || exif?.ProfileDescription || "",
				},
				{ key: "Rendering Intent", value: exif?.RenderingIntent || "" },
			];

			const other: MetaEntry[] = [
				{
					key: "Megapixels",
					value: ((img.width * img.height) / 1_000_000).toFixed(1),
				},
				{
					key: "Lens Info",
					value: exif?.LensInfo
						? Array.isArray(exif.LensInfo)
							? exif.LensInfo.join("-")
							: String(exif.LensInfo)
						: "",
				},
				{
					key: "Digital Zoom",
					value: exif?.DigitalZoomRatio
						? formatNumber(exif.DigitalZoomRatio, 2)
						: "",
				},
				{
					key: "FOV",
					value: exif?.FOV ? `${formatNumber(exif.FOV, 1)} deg` : "",
				},
			];

			const prune = (arr: MetaEntry[]) => arr.filter((e) => e.value);

			return {
				overview: prune(overview),
				camera: prune(camera),
				capture: prune(capture),
				location: prune(location),
				software: prune(software),
				color: prune(color),
				other: prune(other),
			} as MetaCategories;
		},
		[],
	);

	const onFileSelect = useCallback(
		async (f: File | null) => {
			if (!f) return;
			setFile(f);
			setBaseName(f.name.replace(/\.[^/.]+$/, ""));
			setResult(null);
			setCategories(null);
			setMetaApprox(null);
			setLoading(true);
			try {
				if (previewUrl) URL.revokeObjectURL(previewUrl);
				const url = URL.createObjectURL(f);
				setPreviewUrl(url);
				const img = new Image();
				img.src = url;
				await img.decode();
				const arrayBuffer = await f.arrayBuffer();

				try {
					const canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					const ctx = canvas.getContext("2d");
					if (ctx) ctx.drawImage(img, 0, 0);
					const mime = f.type || "image/png";
					const strippedBlob: Blob = await new Promise((res) =>
						canvas.toBlob((b) => res(b!), mime, 0.92),
					);
					const diff = f.size - strippedBlob.size;
					if (diff > 0)
						setMetaApprox({ bytes: diff, pct: (diff / f.size) * 100 });
				} catch {}

				let exifData: any = null;
				let iccDetected = false;
				try {
					if (/image\/(jpeg|jpg|png|webp|heic|avif)/i.test(f.type)) {
						const exifr = await import("exifr");
						exifData = await exifr.parse(f).catch(() => null);
						if (f.type === "image/png") {
							const view = new DataView(arrayBuffer);
							let offset = 8;
							while (offset + 8 < view.byteLength) {
								const length = view.getUint32(offset);
								const typeBytes = new Uint8Array(arrayBuffer, offset + 4, 4);
								const type = new TextDecoder().decode(typeBytes);
								if (type === "iCCP") {
									iccDetected = true;
									break;
								}
								offset += 12 + length;
								if (type === "IEND") break;
							}
						}
					}
				} catch {}

				const cats = buildCategories(f, img, exifData, {
					icc: iccDetected || !!exifData?.ICCProfileName,
				});
				setCategories(cats);
			} catch (err) {
				toast.error("Failed to read image");
			} finally {
				setLoading(false);
			}
		},
		[previewUrl, buildCategories],
	);

	const handleClear = useCallback(() => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		setFile(null);
		setPreviewUrl(null);
		setResult(null);
		setCategories(null);
		setMetaApprox(null);
		setBaseName("metadata");
	}, [previewUrl]);

	const process = useCallback(async () => {
		if (!file || !previewUrl) return;
		setLoading(true);
		try {
			const img = new Image();
			img.src = previewUrl;
			await img.decode();

			const canvasReencode = async (mime: string) => {
				const canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext("2d");
				if (ctx) ctx.drawImage(img, 0, 0);
				return await new Promise<Blob>((res) =>
					canvas.toBlob((b) => res(b!), mime, 0.92),
				);
			};

			if (stripAll) {
				const mime = file.type || "image/png";
				const blob = await canvasReencode(mime);
				if (result?.url) URL.revokeObjectURL(result.url);
				const strippedUrl = URL.createObjectURL(blob);
				setResult({
					url: strippedUrl,
					mime,
					size: blob.size,
					width: img.width,
					height: img.height,
				});
				return;
			}

			const anySelected = Object.values(stripCategories).some(Boolean);
			if (!anySelected) {
				if (result?.url) URL.revokeObjectURL(result.url);
				const originalUrl = URL.createObjectURL(file);
				setResult({
					url: originalUrl,
					mime: file.type || "image/png",
					size: file.size,
					width: img.width,
					height: img.height,
				});
				return;
			}

			const type = file.type;
			const arrayBuffer = await file.arrayBuffer();
			let outputBlob: Blob | null = null;

			if (/image\/(jpeg|jpg)/i.test(type)) {
				try {
					const piexif = await import("piexifjs");
					const binary = new Uint8Array(arrayBuffer).reduce(
						(acc, b) => acc + String.fromCharCode(b),
						"",
					);
					let exifObj = {} as any;
					try {
						const exifRaw = piexif.load(binary);
						exifObj = exifRaw;
						if (stripCategories.camera) exifObj["0th"] = {};
						if (stripCategories.capture) exifObj.Exif = {};
						if (stripCategories.location) exifObj.GPS = {};
						if (stripCategories.other) exifObj.Interop = {};
						if (stripCategories.orientation && exifObj["0th"]) {
							delete exifObj["0th"][piexif.ImageIFD.Orientation];
						}
						if (stripCategories.software && exifObj["0th"]) {
							delete exifObj["0th"][piexif.ImageIFD.Software];
						}
					} catch {}

					let newData = piexif.remove(binary);
					const hasRemaining = Object.values(exifObj).some(
						(grp: any) => grp && Object.keys(grp).length > 0,
					);
					if (hasRemaining) {
						const exifBytes = piexif.dump(exifObj);
						newData = piexif.insert(exifBytes, newData);
					}

					if (stripCategories.icc || stripCategories.xmp) {
						const bytes = new Uint8Array(newData.length);
						for (let i = 0; i < newData.length; i++)
							bytes[i] = newData.charCodeAt(i);
						let offset = 2;
						const outParts: number[] = [0xff, 0xd8];
						while (offset + 4 < bytes.length) {
							if (bytes[offset] !== 0xff) break;
							const marker = bytes[offset + 1];
							if (marker === 0xda) {
								for (let i = offset; i < bytes.length; i++)
									outParts.push(bytes[i]);
								break;
							}
							const len = (bytes[offset + 2] << 8) + bytes[offset + 3];
							const segment = bytes.slice(offset + 4, offset + 2 + len);
							let keep = true;
							if (marker === 0xe2 && stripCategories.icc) {
								const header = new TextDecoder().decode(segment.slice(0, 11));
								if (header.startsWith("ICC_PROFILE")) keep = false;
							}
							if (marker === 0xe1 && stripCategories.xmp) {
								const header = new TextDecoder().decode(segment.slice(0, 29));
								if (header.includes("http://ns.adobe.com/xap/1.0/"))
									keep = false;
							}
							if (keep) {
								outParts.push(0xff, marker, (len >> 8) & 0xff, len & 0xff);
								for (let i = 0; i < segment.length; i++)
									outParts.push(segment[i]);
							}
							offset += 2 + len;
						}
						outputBlob = new Blob([new Uint8Array(outParts)], { type: type });
					} else {
						const outArr = new Uint8Array(newData.length);
						for (let i = 0; i < newData.length; i++)
							outArr[i] = newData.charCodeAt(i);
						outputBlob = new Blob([outArr], { type: type });
					}
				} catch {
					outputBlob = await canvasReencode(type);
				}
			} else if (/image\/png/i.test(type)) {
				try {
					const bytes = new Uint8Array(arrayBuffer);
					const out: number[] = [];
					for (let i = 0; i < 8; i++) out.push(bytes[i]);
					let offset = 8;
					while (offset + 8 < bytes.length) {
						const length =
							(bytes[offset] << 24) |
							(bytes[offset + 1] << 16) |
							(bytes[offset + 2] << 8) |
							bytes[offset + 3];
						const typeBytes = bytes.slice(offset + 4, offset + 8);
						const typeStr = new TextDecoder().decode(typeBytes);
						const dataStart = offset + 8;
						const dataEnd = dataStart + length;
						const crcEnd = dataEnd + 4;
						let drop = false;
						if (stripCategories.icc && typeStr === "iCCP") drop = true;
						if (
							(stripCategories.software || stripCategories.other) &&
							(typeStr === "tEXt" || typeStr === "iTXt" || typeStr === "zTXt")
						)
							drop = true;
						if (!drop) {
							for (let i = offset; i < crcEnd; i++) out.push(bytes[i]);
						}
						offset = crcEnd;
						if (typeStr === "IEND") break;
					}
					outputBlob = new Blob([new Uint8Array(out)], { type });
				} catch {
					outputBlob = await canvasReencode(type);
				}
			} else if (/image\/webp/i.test(type)) {
				outputBlob = await canvasReencode(type);
			} else if (/image\/(heic|heif|avif)/i.test(type)) {
				outputBlob = await canvasReencode("image/png");
			} else {
				const originalUrl = URL.createObjectURL(file);
				if (result?.url) URL.revokeObjectURL(result.url);
				setResult({
					url: originalUrl,
					mime: file.type || "image/png",
					size: file.size,
					width: img.width,
					height: img.height,
				});
				return;
			}

			if (!outputBlob) {
				outputBlob = await canvasReencode(file.type || "image/png");
			}

			if (result?.url) URL.revokeObjectURL(result.url);
			const outUrl = URL.createObjectURL(outputBlob);
			setResult({
				url: outUrl,
				mime: outputBlob.type || file.type || "image/png",
				size: outputBlob.size,
				width: img.width,
				height: img.height,
			});
		} catch {
		} finally {
			setLoading(false);
		}
	}, [file, previewUrl, stripAll, result?.url, stripCategories]);

	const sizeDelta = useMemo(() => {
		if (!file || !result) return null;
		const diff = result.size - file.size;
		const pct = (diff / file.size) * 100;
		return { diff, pct };
	}, [file, result]);

	useEffect(() => {
		if (file) {
			process();
		}
	}, [file, stripAll, process]);

	const shouldDisableDownload = !result;

	const renderCategoryCard = (
		title: string,
		entries: MetaEntry[] | undefined,
		emptyMessage: string,
	) => (
		<Card className="p-4 space-y-3" key={title}>
			<p className="text-sm font-medium">{title}</p>
			<div className="divide-y rounded-md border">
				{entries && entries.length > 0 ? (
					entries.map((e) => (
						<div
							key={e.key}
							className="flex items-center justify-between gap-4 px-3 py-2 text-xs"
						>
							<span className="text-muted-foreground">{e.key}</span>
							<span className="font-medium text-right break-all max-w-[60%]">
								{e.value || "-"}
							</span>
						</div>
					))
				) : (
					<div className="px-3 py-6 text-center text-xs text-muted-foreground">
						{emptyMessage}
					</div>
				)}
			</div>
		</Card>
	);

	return (
		<div className="container mx-auto max-w-6xl p-6 space-y-8">
			<header className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
					<Info className="size-5" /> Metadata Viewer
				</h1>
				<p className="text-sm text-muted-foreground">
					Inspect image details and  strip metadata
				</p>
			</header>

			<div className="grid gap-8 md:grid-cols-2 items-start">
				<div className="space-y-6">
					<ImageDropzone
						onFileSelect={onFileSelect}
						onClear={handleClear}
						accept="image/*"
						showMetadata={true}
					/>

					{renderCategoryCard(
						"Overview",
						categories?.overview,
						file
							? loading
								? "Loading..."
								: "No overview metadata."
							: "Select an image.",
					)}
					{renderCategoryCard(
						"Camera",
						categories?.camera,
						file
							? loading
								? "Loading..."
								: "No camera metadata."
							: "Select an image.",
					)}
					{renderCategoryCard(
						"Capture Settings",
						categories?.capture,
						file
							? loading
								? "Loading..."
								: "No capture settings."
							: "Select an image.",
					)}
					{renderCategoryCard(
						"Location",
						categories?.location,
						file
							? loading
								? "Loading..."
								: "No location data."
							: "Select an image.",
					)}
				</div>

				<div className="space-y-6">
					<PreviewOutput
						title={
							stripAll
								? "Stripped Output"
								: Object.values(stripCategories).some(Boolean)
									? "Selective Output"
									: "Original Output"
						}
						result={result}
						baseName={baseName}
						setBaseName={setBaseName}
						ext={(file?.name.split(".").pop() || "png").toLowerCase()}
						sizeDelta={sizeDelta}
						disabled={shouldDisableDownload}
						placeholder="No output yet"
						footerNote={
							file ? (
								<span>Original size: {(file.size / 1024).toFixed(1)} KB</span>
							) : null
						}
						hideImagePreview={true}
					/>

					<Card className="p-4 space-y-4">
						<p className="text-sm font-medium">Strip Options</p>
						<div className="space-y-3 text-sm">
							<label className="flex items-start gap-3">
								<Checkbox
									checked={stripAll}
									onCheckedChange={(v) => setStripAll(!!v)}
								/>
								<span>
									<span className="font-medium">Full Strip (All Metadata)</span>
									<span className="block text-xs text-muted-foreground">
										{stripAll
											? "Removes everything (EXIF, GPS, XMP, ICC)."
											: "Turn off to selectively remove chosen groups."}
									</span>
								</span>
							</label>
							<div className="pt-2 space-y-2 border-t">
								<div className="flex items-center justify-between">
									<span className="text-xs font-medium">
										Selective Categories
									</span>
									<label className="flex items-center gap-2 text-xs">
										<Checkbox
											checked={stripAllCategories}
											onCheckedChange={(v) => {
												const val = !!v;
												setStripAllCategories(val);
												setStripCategories(
													(prev) =>
														Object.fromEntries(
															Object.entries(prev).map(([k]) => [k, val]),
														) as any,
												);
											}}
										/>
										<span>Select All</span>
									</label>
								</div>
								<div className="grid grid-cols-2 gap-2 text-xs">
									{Object.entries(stripCategories).map(([key, val]) => (
										<label key={key} className="flex items-center gap-2">
											<Checkbox
												checked={val}
												onCheckedChange={(v) => {
													const nv = !!v;
													setStripCategories((prev) => ({
														...prev,
														[key]: nv,
													}));
												}}
											/>
											<span className="capitalize">{key}</span>
										</label>
									))}
								</div>
							</div>
							{metaApprox && (
								<p className="text-xs text-muted-foreground">
									Metadata takes {(metaApprox.bytes / 1024).toFixed(2)} KB (
									{metaApprox.pct.toFixed(2)}%) of this image.
								</p>
							)}
						</div>
						<p className="text-xs text-muted-foreground leading-relaxed">
							Removing ICC profile or orientation tags can change color
							appearance or rotation in some viewers.
						</p>
					</Card>

					{renderCategoryCard(
						"Software",
						categories?.software,
						file
							? loading
								? "Loading..."
								: "No software metadata."
							: "Select an image.",
					)}
					{renderCategoryCard(
						"Color / Profile",
						categories?.color,
						file ? "No color/profile metadata." : "Select an image.",
					)}
					{renderCategoryCard(
						"Other",
						categories?.other,
						file ? "No additional metadata." : "Select an image.",
					)}
				</div>
			</div>
		</div>
	);
}

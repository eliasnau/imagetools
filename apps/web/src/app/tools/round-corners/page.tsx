"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageDropzone } from "@/components/image-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	IMAGE_FORMATS,
	extensionFor,
	formatName,
	isLossy,
	listOutputMimes,
	supportsAlpha,
} from "@/lib/image-formats";
import { PreviewOutput } from "@/components/preview-output";

const OUTPUT_MIMES = listOutputMimes();
const PRESET_RADII = [8, 16, 24, 32, 48, 64] as const;

type FormatMime = (typeof OUTPUT_MIMES)[number];
interface ResultMeta {
	url: string;
	mime: string;
	size: number;
	width: number;
	height: number;
}

export default function RoundCornersPage() {
	const [fileObj, setFileObj] = useState<File | null>(null);
	const [fileUrl, setFileUrl] = useState<string | null>(null);
	const [imageMeta, setImageMeta] = useState<{
		width: number;
		height: number;
		size: number;
	} | null>(null);
	const [radius, setRadius] = useState(32);
	const [background, setBackground] = useState<
		"transparent" | "white" | "black"
	>("transparent");
	const [format, setFormat] = useState<FormatMime>(OUTPUT_MIMES[0]);
	const [quality, setQuality] = useState(85);
	const [baseName, setBaseName] = useState("");
	const [result, setResult] = useState<ResultMeta | null>(null);
	const [status, setStatus] = useState<"idle" | "converting" | "error">("idle");
	const [error, setError] = useState<string | null>(null);
	const [alphaWarning, setAlphaWarning] = useState<string | null>(null);
	const imgRef = useRef<HTMLImageElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const lossy = useMemo(() => isLossy(format), [format]);
	const ext = useMemo(() => extensionFor(format) || "out", [format]);

	useEffect(
		() => () => {
			if (fileUrl) URL.revokeObjectURL(fileUrl);
			if (result?.url) URL.revokeObjectURL(result.url);
		},
		[fileUrl, result?.url],
	);

	const reset = () => {
		if (fileUrl) URL.revokeObjectURL(fileUrl);
		if (result?.url) URL.revokeObjectURL(result.url);
		setFileObj(null);
		setFileUrl(null);
		setImageMeta(null);
		setResult(null);
		setError(null);
		setStatus("idle");
		setBaseName("");
		setAlphaWarning(null);
		imgRef.current = null;
	};

	const handleSelectFile = useCallback((f: File | null) => {
		if (!f) return;
		reset(); // reset revokes old urls
		const url = URL.createObjectURL(f);
		setFileUrl(url);
		setFileObj(f);
		const rawBase = f.name.replace(/\.[^/.]+$/, "");
		const appended = /-rounded$/i.test(rawBase)
			? rawBase
			: rawBase + "-rounded";
		setBaseName(appended);
		// detect original format
		const orig = IMAGE_FORMATS.find((ff) => ff.mime === f.type);
		if (orig) setFormat(orig.mime as FormatMime);
		const img = new Image();
		img.onload = () => {
			imgRef.current = img;
			setImageMeta({ width: img.width, height: img.height, size: f.size });
		};
		img.onerror = () => setError("Failed to load image");
		img.src = url;
	}, []);

	const maxRadius = useMemo(
		() =>
			imageMeta
				? Math.floor(Math.min(imageMeta.width, imageMeta.height) / 2)
				: 0,
		[imageMeta],
	);

	useEffect(() => {
		if (!imageMeta || !imgRef.current || !fileObj) return;
		let cancelled = false;
		const run = async () => {
			try {
				setStatus("converting");
				setError(null);
				setAlphaWarning(null);
				const img = imgRef.current!;
				const canvas = canvasRef.current || document.createElement("canvas");
				canvasRef.current = canvas;
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext("2d");
				if (!ctx) throw new Error("Canvas unsupported");
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				const r = Math.min(radius, maxRadius);
				const wantsTransparent = background === "transparent";
				const alphaOk = supportsAlpha(format);
				let effectiveBg: string | null = null;
				if (!alphaOk && wantsTransparent) {
					effectiveBg = "#ffffff";
					setAlphaWarning(
						`${formatName(format)} does not support transparency. Using white background. For transparency use PNG or WebP.`,
					);
				} else if (!wantsTransparent) {
					effectiveBg =
						background === "white"
							? "#ffffff"
							: background === "black"
								? "#000000"
								: null;
				}
				if (effectiveBg) {
					ctx.fillStyle = effectiveBg;
					ctx.fillRect(0, 0, canvas.width, canvas.height);
				}
				ctx.save();
				if (r > 0) {
					const w = canvas.width,
						h = canvas.height,
						rr = r;
					ctx.beginPath();
					ctx.moveTo(rr, 0);
					ctx.lineTo(w - rr, 0);
					ctx.arcTo(w, 0, w, rr, rr);
					ctx.lineTo(w, h - rr);
					ctx.arcTo(w, h, w - rr, h, rr);
					ctx.lineTo(rr, h);
					ctx.arcTo(0, h, 0, h - rr, rr);
					ctx.lineTo(0, rr);
					ctx.arcTo(0, 0, rr, 0, rr);
					ctx.closePath();
					ctx.clip();
				}
				ctx.drawImage(img, 0, 0);
				ctx.restore();
				const q = lossy ? quality / 100 : undefined;
				const blob: Blob | null = await new Promise((res) =>
					canvas.toBlob((b) => res(b), format, q),
				);
				if (cancelled) return;
				if (!blob) throw new Error("Conversion failed (browser limitation)");
				if (result?.url) URL.revokeObjectURL(result.url);
				const outUrl = URL.createObjectURL(blob);
				setResult({
					url: outUrl,
					mime: format,
					size: blob.size,
					width: img.width,
					height: img.height,
				});
				setStatus("idle");
			} catch (e: any) {
				if (cancelled) return;
				setError(e.message || "Unexpected error");
				setStatus("error");
			}
		};
		run();
		return () => {
			cancelled = true;
		};
	}, [
		imageMeta,
		radius,
		background,
		format,
		quality,
		lossy,
		fileObj,
		maxRadius,
	]);

	const sizeDelta = useMemo(() => {
		if (!imageMeta || !result) return null;
		const diff = result.size - imageMeta.size;
		return { diff, pct: (diff / imageMeta.size) * 100 };
	}, [imageMeta, result]);

	return (
		<main className="container mx-auto max-w-4xl p-6 space-y-6">
			<header className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">Round Corners</h1>
				<p className="text-sm text-muted-foreground">
					Apply rounded corners and export in multiple formats.
				</p>
			</header>
			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-4">
					<ImageDropzone
						onFileSelect={(f) => handleSelectFile(f)}
						onClear={reset}
						aspect="aspect-video"
						showMetadata={true}
					/>
					<div className="space-y-4 rounded-lg border p-4">
						<div className="space-y-2">
							<Label className="text-sm font-medium">Corner Radius</Label>
							<div className="flex flex-wrap gap-2">
								{PRESET_RADII.map((val) => {
									const active = radius === val;
									return (
										<Button
											key={val}
											variant={active ? "default" : "secondary"}
											size="sm"
											onClick={() => setRadius(val)}
										>
											{val}
										</Button>
									);
								})}
								<Button
									variant={
										PRESET_RADII.includes(radius as any)
											? "secondary"
											: "default"
									}
									size="sm"
									onClick={() => {
										if (PRESET_RADII.includes(radius as any)) {
											const targetMax = maxRadius || 300;
											let custom = 65;
											if (custom > targetMax) custom = targetMax;
											// ensure not a preset
											while (
												PRESET_RADII.includes(custom as any) &&
												custom < targetMax
											) {
												custom++;
											}
											setRadius(custom);
										}
									}}
								>
									Custom
								</Button>
							</div>
							{!PRESET_RADII.includes(radius as any) && (
								<div className="pt-2 space-y-2">
									<div className="flex items-center gap-2">
										<Input
											type="number"
											className="h-8 w-24"
											value={radius}
											onChange={(e) => {
												const v = parseInt(e.target.value, 10);
												if (!isNaN(v))
													setRadius(Math.min(Math.max(0, v), maxRadius || v));
											}}
										/>
										<span className="text-xs text-muted-foreground">
											px (max {maxRadius})
										</span>
									</div>
									<Slider
										id="radius"
										min={0}
										max={maxRadius || 300}
										step={1}
										value={[Math.min(radius, maxRadius || radius)]}
										onValueChange={(v) => setRadius(v[0])}
									/>
								</div>
							)}
						</div>
						<div className="space-y-2">
							<Label className="text-sm font-medium">Background</Label>
							<div className="flex gap-2">
								{(["transparent", "white", "black"] as const).map((bg) => (
									<Button
										key={bg}
										type="button"
										variant={background === bg ? "default" : "secondary"}
										size="sm"
										onClick={() => setBackground(bg)}
									>
										{bg}
									</Button>
								))}
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="format" className="text-sm font-medium">
								Output Format
							</Label>
							<Select
								value={format}
								onValueChange={(v) => setFormat(v as FormatMime)}
							>
								<SelectTrigger id="format" className="h-10 w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{IMAGE_FORMATS.map((f) => (
										<SelectItem key={f.mime} value={f.mime}>
											{f.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{lossy && (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label htmlFor="quality" className="text-sm font-medium">
										Quality
									</Label>
									<span className="text-sm font-medium tabular-nums">
										{quality}%
									</span>
								</div>
								<Slider
									id="quality"
									min={10}
									max={100}
									step={1}
									value={[quality]}
									onValueChange={(v) => setQuality(v[0])}
								/>
							</div>
						)}
						{status === "converting" && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin" /> Converting…
							</div>
						)}
					</div>
				</div>
				<div className="space-y-4">
					<PreviewOutput
						result={result}
						baseName={baseName}
						setBaseName={setBaseName}
						ext={ext}
						sizeDelta={sizeDelta}
						warning={alphaWarning}
						error={error}
						title="Rounded Image"
						placeholder="No output yet"
						previewHeight={420}
						footerNote={"All processing happens locally in your browser."}
					/>
				</div>
			</div>
			<canvas ref={canvasRef} className="hidden" aria-hidden />
		</main>
	);
}

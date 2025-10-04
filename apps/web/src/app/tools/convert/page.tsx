"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import { ImageDropzone } from "@/components/image-dropzone";
import { Label } from "@/components/ui/label";
import { PreviewOutput } from "@/components/preview-output";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import { Loader2 } from "lucide-react";

import {
	IMAGE_FORMATS,
	extensionFor,
	isLossy,
	listOutputMimes,
} from "@/lib/image-formats";

const OUTPUT_MIMES = listOutputMimes();

type FormatMime = (typeof OUTPUT_MIMES)[number];

interface ResultMeta {
	url: string;
	mime: string;
	size: number;
	width: number;
	height: number;
}

export default function ConvertImagePage() {
	const [fileUrl, setFileUrl] = useState<string | null>(null);
	const [fileObj, setFileObj] = useState<File | null>(null);
	const [imageMeta, setImageMeta] = useState<{
		width: number;
		height: number;
		size: number;
	} | null>(null);

	const [format, setFormat] = useState<FormatMime>(OUTPUT_MIMES[0]);
	const [quality, setQuality] = useState(85);
	const [baseName, setBaseName] = useState("");

	const [result, setResult] = useState<ResultMeta | null>(null);
	const [status, setStatus] = useState<"idle" | "converting" | "error">("idle");
	const [error, setError] = useState<string | null>(null);

	const imgRef = useRef<HTMLImageElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const activeJobRef = useRef<number>(0);

	const lossy = useMemo(() => isLossy(format), [format]);
	const ext = useMemo(() => extensionFor(format) || "out", [format]);

	useEffect(() => {
		return () => {
			if (fileUrl) URL.revokeObjectURL(fileUrl);
			if (result?.url) URL.revokeObjectURL(result.url);
		};
	}, [fileUrl, result?.url]);

	const reset = () => {
		if (fileUrl) URL.revokeObjectURL(fileUrl);
		if (result?.url) URL.revokeObjectURL(result.url);
		setFileUrl(null);
		setFileObj(null);
		setImageMeta(null);
		setResult(null);
		setError(null);
		setStatus("idle");
		setBaseName("");
		imgRef.current = null;
	};

	const handleSelectFile = useCallback(
		(f: File | null) => {
			if (!f) return;
			if (fileUrl) URL.revokeObjectURL(fileUrl);
			if (result?.url) URL.revokeObjectURL(result.url);

			const url = URL.createObjectURL(f);
			setFileUrl(url);
			setFileObj(f);

			const rawBase = f.name.replace(/\.[^/.]+$/, "");
			const appended = /-converted$/i.test(rawBase)
				? rawBase
				: rawBase + "-converted";
			setBaseName(appended);

			const img = new Image();
			img.onload = () => {
				imgRef.current = img;
				setImageMeta({ width: img.width, height: img.height, size: f.size });
			};
			img.onerror = () => {
				setError("Failed to load image");
			};
			img.src = url;
		},
		[fileUrl, result?.url],
	);

	useEffect(() => {
		if (!imageMeta || !imgRef.current || !fileObj) return;

		const jobId = ++activeJobRef.current;
		const doConvert = async () => {
			try {
				setStatus("converting");
				setError(null);

				const img = imgRef.current!;
				const canvas = canvasRef.current || document.createElement("canvas");
				canvasRef.current = canvas;
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext("2d");
				if (!ctx) throw new Error("Canvas unsupported");
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, 0, 0);

				const q = lossy ? quality / 100 : undefined;
				const blob: Blob | null = await new Promise((resolve) =>
					canvas.toBlob((b) => resolve(b), format, q),
				);
				if (activeJobRef.current !== jobId) return;
				if (!blob) {
					let msg = "Conversion failed (browser limitation)";
					if (format === "image/x-icon") {
						msg = "ICO export not supported by this browser's canvas API.";
					}
					throw new Error(msg);
				}

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
				if (activeJobRef.current !== jobId) return;
				setError(e.message || "Unexpected error");
				setStatus("error");
			}
		};

		doConvert();
	}, [imageMeta, format, quality, lossy, fileObj]);

	const sizeDelta = useMemo(() => {
		if (!imageMeta || !result) return null;
		const diff = result.size - imageMeta.size;
		return { diff, pct: (diff / imageMeta.size) * 100 };
	}, [imageMeta, result]);

	return (
		<main className="container mx-auto max-w-4xl p-6 space-y-6">
			<header className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">
					Image Converter
				</h1>
				<p className="text-sm text-muted-foreground">
					Convert images instantly in your browser. No uploads required.
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
									onValueChange={(val) => setQuality(val[0])}
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
						error={error}
						title="Converted Image"
						placeholder="No output yet"
						previewHeight={420}
						footerNote={
							"All processing happens locally in your browser. AVIF format may not be supported in all browsers."
						}
					/>
				</div>
			</div>

			<canvas ref={canvasRef} className="hidden" aria-hidden />
		</main>
	);
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";

export interface ImageDropzoneProps {
	className?: string;
	onFileSelect?: (file: File) => void;
	onClear?: () => void;
	autoPreview?: boolean;
	previewAlt?: string;
	accept?: string;
	aspect?: string;
	emptyHintTitle?: string;
	emptyHintSubtitle?: string;
	id?: string;
	disabled?: boolean;
	initialFile?: File | null;
	showMetadata?: boolean;
}

function fileTypeLabel(file: File | null) {
	if (!file) return "IMG";
	const nameExt = file.name.includes(".")
		? file.name.split(".").pop()
		: undefined;
	const mimeExt = file.type?.split("/").pop();
	return (nameExt || mimeExt || "IMG").toUpperCase();
}

function middleTruncate(name: string, max = 80, head = 40, tail = 20) {
	if (name.length <= max) return name;
	return `${name.slice(0, head)}…${name.slice(-tail)}`;
}

export function ImageDropzone({
	className = "",
	onFileSelect,
	onClear,
	autoPreview = true,
	previewAlt = "Preview",
	accept = "image/*",
	aspect = "aspect-video",
	emptyHintTitle = "Choose an image",
	emptyHintSubtitle = "drag & drop, click or paste",
	id = "image-dropzone-input",
	disabled = false,
	initialFile = null,
	showMetadata = true,
}: ImageDropzoneProps) {
	const [file, setFile] = useState<File | null>(initialFile || null);
	const [url, setUrl] = useState<string | null>(null);
	const [metadata, setMetadata] = useState<{
		width: number;
		height: number;
		size: number;
	} | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (initialFile) setFile(initialFile);
	}, [initialFile]);

	useEffect(() => {
		if (!file) {
			if (url) {
				URL.revokeObjectURL(url);
				setUrl(null);
			}
			setMetadata(null);
			return;
		}
		const obj = URL.createObjectURL(file);
		setUrl(obj);
		if (showMetadata) {
			const img = new Image();
			img.onload = () => {
				setMetadata({ width: img.width, height: img.height, size: file.size });
			};
			img.src = obj;
		}
		return () => URL.revokeObjectURL(obj);
	}, [file, showMetadata]);

	const clear = useCallback(() => {
		setFile(null);
		setMetadata(null);
		onClear?.();
	}, [onClear]);

	const handleSelect = useCallback(
		(f: File | null) => {
			if (!f) return;
			setFile(f);
			onFileSelect?.(f);
		},
		[onFileSelect],
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleSelect(e.target.files?.[0] || null);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		if (disabled) return;
		e.preventDefault();
		handleSelect(e.dataTransfer.files?.[0] || null);
	};

	// Handle paste
	useEffect(() => {
		if (disabled) return;
		const onPaste = (e: ClipboardEvent) => {
			if (disabled) return;
			if (!e.clipboardData) return;
			const items = Array.from(e.clipboardData.items);
			const fileItem = items.find(
				(it) => it.kind === "file" && it.type.startsWith("image/"),
			);
			if (fileItem) {
				const f = fileItem.getAsFile();
				if (f) {
					e.preventDefault();
					handleSelect(f);
				}
			}
		};
		document.addEventListener("paste", onPaste);
		return () => document.removeEventListener("paste", onPaste);
	}, [handleSelect, disabled]);

	const typeLabel = fileTypeLabel(file);
	const displayName = file ? middleTruncate(file.name) : "Image";

	return (
		<div
			onDragOver={(e) => {
				if (!disabled) e.preventDefault();
			}}
			onDrop={handleDrop}
			className={
				`relative flex w-full items-center justify-center overflow-hidden rounded-lg border-2 transition-colors ` +
				(file
					? "border-border"
					: "border-dashed border-muted-foreground/25 hover:border-muted-foreground/50") +
				(disabled ? " opacity-60 pointer-events-none" : "") +
				(className ? ` ${className}` : "") +
				(!file ? ` ${aspect}` : "")
			}
		>
			{url && autoPreview ? (
				<div
					className="grid w-full items-center p-4 gap-4"
					style={{ gridTemplateColumns: "auto 1fr auto" }}
				>
					<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-background">
						<img
							src={url as string}
							alt={file?.name || previewAlt}
							className="h-full w-full object-cover"
						/>
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<p
								className="text-sm font-medium truncate max-w-[200px] sm:max-w-[260px]"
								title={file?.name}
							>
								{displayName}
							</p>
							<span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground/80 border">
								{typeLabel}
							</span>
						</div>
						{showMetadata && metadata && (
							<div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
								<span>
									{metadata.width} × {metadata.height}
								</span>
								<span>{(metadata.size / 1024).toFixed(1)} KB</span>
							</div>
						)}
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 cursor-pointer"
						onClick={clear}
						aria-label="Delete image"
					>
						<Trash className="h-4 w-4" />
					</Button>
				</div>
			) : (
				<label
					htmlFor={id}
					className="flex cursor-pointer flex-col items-center gap-3 p-6 text-center"
				>
					<div className="rounded-full bg-muted p-3">
						<Upload className="h-5 w-5 text-muted-foreground" />
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium">{emptyHintTitle}</p>
						<p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
							{emptyHintSubtitle} <Kbd>⌘V</Kbd>
						</p>
					</div>
					<Input
						ref={inputRef}
						id={id}
						type="file"
						accept={accept}
						disabled={disabled}
						className="hidden"
						onChange={handleInputChange}
					/>
				</label>
			)}
		</div>
	);
}

export interface UseImageDropzoneResult {
	file: File | null;
	url: string | null;
	clear: () => void;
	setFile: (f: File | null) => void;
}

export function useImageDropzone(
	initial?: File | null,
): UseImageDropzoneResult {
	const [file, setFile] = useState<File | null>(initial || null);
	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		if (file) {
			const obj = URL.createObjectURL(file);
			setUrl(obj);
			return () => URL.revokeObjectURL(obj);
		} else {
			setUrl(null);
		}
	}, [file]);

	const clear = useCallback(() => setFile(null), []);

	return { file, url, clear, setFile };
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

export interface ImageDropzoneProps {
	className?: string;
	onFileSelect?: (file: File) => void;
	onClear?: () => void;
	autoPreview?: boolean;
	previewAlt?: string;
	accept?: string;
	aspect?: string; // e.g. aspect-video
	emptyHintTitle?: string;
	emptyHintSubtitle?: string;
	id?: string;
	disabled?: boolean;
	initialFile?: File | null;
}

interface InternalState {
	url: string | null;
	file: File | null;
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
	emptyHintSubtitle = "or drag and drop",
	id = "image-dropzone-input",
	disabled = false,
	initialFile = null,
}: ImageDropzoneProps) {
	const [state, setState] = useState<InternalState>({ url: null, file: null });
	const inputRef = useRef<HTMLInputElement | null>(null);

	// Initialize if initialFile provided
	useEffect(() => {
		if (initialFile) {
			const obj = URL.createObjectURL(initialFile);
			setState({ url: obj, file: initialFile });
		}
	}, [initialFile]);

	// Revoke object URL on unmount or file change
	useEffect(() => {
		return () => {
			if (state.url) URL.revokeObjectURL(state.url);
		};
	}, [state.url]);

	const clear = useCallback(() => {
		if (state.url) URL.revokeObjectURL(state.url);
		setState({ url: null, file: null });
		onClear?.();
	}, [state.url, onClear]);

	const handleSelect = useCallback(
		(file: File | null) => {
			if (!file) return;
			if (state.url) URL.revokeObjectURL(state.url);
			const url = URL.createObjectURL(file);
			setState({ url, file });
			onFileSelect?.(file);
		},
		[state.url, onFileSelect],
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleSelect(e.target.files?.[0] || null);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		if (disabled) return;
		e.preventDefault();
		handleSelect(e.dataTransfer.files?.[0] || null);
	};

	return (
		<div
			onDragOver={(e) => {
				if (!disabled) e.preventDefault();
			}}
			onDrop={handleDrop}
			className={
				`${aspect} relative flex w-full items-center justify-center overflow-hidden rounded-lg border-2 transition-colors ` +
				(state.url
					? "border-border bg-muted"
					: "border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50") +
				(disabled ? " opacity-60 pointer-events-none" : "") +
				(className ? ` ${className}` : "")
			}
		>
			{state.url && autoPreview ? (
				<>
					<img
						src={state.url || "/placeholder.svg"}
						alt={state.file?.name || previewAlt}
						className="h-full w-full object-contain p-4"
					/>
					<Button
						variant="ghost"
						size="icon"
						className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
						onClick={clear}
						aria-label="Remove image"
					>
						<X className="h-4 w-4" />
					</Button>
				</>
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
						<p className="text-xs text-muted-foreground">{emptyHintSubtitle}</p>
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

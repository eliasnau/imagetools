"use client";
import { Download, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { formatName } from "@/lib/image-formats";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface PreviewResultMeta {
	url: string;
	mime: string;
	size: number;
	width: number;
	height: number;
}

export interface SizeDeltaMeta {
	diff: number; // bytes difference (output - original)
	pct: number; // percent difference
}

interface PreviewOutputProps {
	title?: string;
	result: PreviewResultMeta | null;
	baseName: string;
	setBaseName: (name: string) => void;
	ext: string; // without dot
	sizeDelta?: SizeDeltaMeta | null;
	disabled?: boolean; // force disable download
	warning?: string | null;
	error?: string | null;
	downloadLabel?: string;
	placeholder?: string;
	previewHeight?: number; // px height for preview box
	className?: string;
	footerNote?: ReactNode; // optional note below card
}

export function PreviewOutput({
	title = "Output Image",
	result,
	baseName,
	setBaseName,
	ext,
	sizeDelta,
	disabled = false,
	warning,
	error,
	downloadLabel = "Download Image",
	placeholder = "No output yet",
	previewHeight = 420,
	className,
	footerNote,
}: PreviewOutputProps) {
	const canDownload = !!result && !!baseName && !disabled;
	const heightClass = `h-[${previewHeight}px]`;

	return (
		<div className={cn("space-y-4", className)}>
			<div className="rounded-lg border p-4 space-y-4">
				<div className="flex items-center gap-2">
					<ImageIcon className="h-4 w-4 text-muted-foreground" />
					<p className="text-sm font-medium">{title}</p>
				</div>
				{result ? (
					<div className="space-y-4">
						<div
							className={cn(
								"flex w-full items-center justify-center overflow-hidden rounded-lg border bg-muted",
								heightClass,
							)}
						>
							<img
								src={result.url}
								alt={title}
								className="h-full w-full object-contain p-4"
							/>
						</div>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="filename-output"
									className="text-sm font-medium"
								>
									Filename
								</Label>
								<InputGroup>
									<InputGroupInput
										id="filename-output"
										value={baseName}
										onChange={(e) =>
											setBaseName(e.target.value.replace(/\.[^/.]+$/, ""))
										}
										placeholder={placeholder}
									/>
									<InputGroupAddon align="inline-end">.{ext}</InputGroupAddon>
								</InputGroup>
							</div>
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground">Format</p>
									<p className="font-medium">
										{result ? formatName(result.mime) : "-"}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground">Size</p>
									<p className="font-medium">
										{(result.size / 1024).toFixed(1)} KB
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground">Dimensions</p>
									<p className="font-medium">
										{result.width} × {result.height}
									</p>
								</div>
								{sizeDelta && (
									<div className="space-y-1">
										<p className="text-xs text-muted-foreground">Change</p>
										<p
											className={cn(
												"font-medium",
												sizeDelta.diff <= 0 ? "text-green-600" : "text-red-600",
											)}
										>
											{sizeDelta.diff > 0 ? "+" : ""}
											{(sizeDelta.diff / 1024).toFixed(1)} KB (
											{sizeDelta.pct > 0 ? "+" : ""}
											{sizeDelta.pct.toFixed(1)}%)
										</p>
									</div>
								)}
							</div>
							{warning && (
								<p className="text-xs text-amber-600 font-medium">{warning}</p>
							)}
							{error && (
								<p className="text-sm text-destructive font-medium">{error}</p>
							)}
							<Button asChild className="w-full h-10" disabled={!canDownload}>
								<a
									href={result?.url || undefined}
									download={`${(baseName || "output").replace(/\.[^/.]+$/, "")}.${ext}`}
									aria-disabled={!canDownload}
								>
									<Download className="mr-2 h-4 w-4" /> {downloadLabel}
								</a>
							</Button>
						</div>
					</div>
				) : (
					<div
						className={cn(
							"flex w-full items-center justify-center rounded-lg border-2 border-dashed",
							heightClass,
						)}
					>
						<p className="text-sm text-muted-foreground">{placeholder}</p>
					</div>
				)}
			</div>
			{footerNote && (
				<p className="text-xs leading-relaxed text-muted-foreground">
					{footerNote}
				</p>
			)}
		</div>
	);
}

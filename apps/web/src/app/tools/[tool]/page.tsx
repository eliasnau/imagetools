"use client";
import Link from "next/link";
import { tools } from "@imagetools/tools";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";
import { SearchCommandButton } from "@/components/search-command-button";
import { useParams } from "next/navigation";

export default function ToolFallbackPage() {
	const {tool} = useParams();
	const entry = tools.find((t) => t.id === tool);

	if (!entry) {
		return (
			<main className="container mx-auto max-w-xl p-8">
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Wrench className="size-6" />
						</EmptyMedia>
						<EmptyTitle>Unknown Tool</EmptyTitle>
						<EmptyDescription>
							The tool id <code className="font-mono text-xs">{tool}</code> is
							not registered. It may have been renamed or removed.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<div className="flex gap-2 flex-wrap justify-center">
							<Link href="/tools">
								<Button variant="secondary" size="sm">
									Browse Tools
								</Button>
							</Link>
							<SearchCommandButton />
						</div>
					</EmptyContent>
				</Empty>
			</main>
		);
	}

	// If an entry exists but no bespoke implementation, provide a placeholder screen.
	return (
		<main className="container mx-auto max-w-xl p-8">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Wrench className="size-6" />
					</EmptyMedia>
					<EmptyTitle>{entry.title}</EmptyTitle>
					{entry.description && (
						<EmptyDescription>{entry.description}</EmptyDescription>
					)}
				</EmptyHeader>
				<EmptyContent>
					<p className="text-sm text-muted-foreground max-w-sm">
						This tool is coming soon
					</p>
					<div className="flex gap-2 flex-wrap justify-center">
						<Link href="/tools">
							<Button variant="secondary" size="sm">
								Browse Tools
							</Button>
						</Link>
						<SearchCommandButton />
					</div>
				</EmptyContent>
			</Empty>
		</main>
	);
}

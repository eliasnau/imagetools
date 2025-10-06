import Link from "next/link";
import { tools } from "@imagetools/tools";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ToolsIndexPage() {
	return (
		<main className="container mx-auto max-w-4xl p-6 space-y-8">
			<header className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">
					Tools Directory
				</h1>
				<p className="text-sm text-muted-foreground">
					Select a tool below. If you followed a broken link, the requested tool
					does not exist.
				</p>
			</header>
			<div className="grid gap-4 sm:grid-cols-2">
				{tools.map((t) => (
					<Link key={t.id} href={`/tools/${t.id}`}>
						<Card className="p-4 hover:border-primary transition-colors cursor-pointer">
							<h2 className="font-medium leading-none mb-1">{t.title}</h2>
							{t.description && (
								<p className="text-xs text-muted-foreground line-clamp-2">
									{t.description}
								</p>
							)}
						</Card>
					</Link>
				))}
			</div>
			{tools.length === 0 && (
				<div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
					No tools are currently registered.
				</div>
			)}
			<div className="pt-4">
				<Button asChild variant="secondary">
					<Link href="/">Back Home</Link>
				</Button>
			</div>
		</main>
	);
}

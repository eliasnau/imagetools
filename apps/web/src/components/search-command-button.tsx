"use client";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchCommandButton() {
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={() => {
				const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true });
				document.dispatchEvent(ev);
			}}
		>
			<Search className="mr-1 size-4" /> Search for a tool
		</Button>
	);
}

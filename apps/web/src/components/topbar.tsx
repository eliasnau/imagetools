"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { tools } from "@imagetools/tools";

// Maps /tools/convert => ["Tools", "Convert"] etc.
function buildBreadcrumb(pathname: string) {
	const parts = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean);
	const items: { href?: string; label: string }[] = [];

	if (parts.length === 0) {
		return [{ label: "Home", href: "/" }];
	}

	let acc = "";
	for (let i = 0; i < parts.length; i++) {
		acc += `/${parts[i]}`;
		let label = parts[i];
		if (label === "tools") label = "Tools";
		// Replace tool id with tool title if found
		if (i === 1 && parts[0] === "tools") {
			const tool = tools.find((t) => t.id === parts[1]);
			if (tool) label = tool.title;
		}
		items.push({
			href: i === parts.length - 1 ? undefined : acc,
			label: label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, " "),
		});
	}
	return items;
}

export function Topbar() {
	const pathname = usePathname();
	const crumbs = buildBreadcrumb(pathname || "/");

	return (
		<header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/60 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
			<SidebarTrigger className="-ml-1" />
			<Separator
				orientation="vertical"
				className="mr-2 data-[orientation=vertical]:h-4"
			/>
			<Breadcrumb>
				<BreadcrumbList>
					{crumbs.map((c, i) => (
						<React.Fragment key={i}>
							<BreadcrumbItem className="hidden sm:flex">
								{c.href ? (
									<BreadcrumbLink href={c.href}>{c.label}</BreadcrumbLink>
								) : (
									<BreadcrumbPage>{c.label}</BreadcrumbPage>
								)}
							</BreadcrumbItem>
							{i < crumbs.length - 1 && (
								<BreadcrumbSeparator className="hidden sm:flex" />
							)}
						</React.Fragment>
					))}
				</BreadcrumbList>
			</Breadcrumb>
		</header>
	);
}

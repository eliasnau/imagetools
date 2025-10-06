"use client";

import * as React from "react";
import { Image, Github, ChevronDown, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavUser } from "@/components/nav-user";
import { CommandSearchBar } from "@/components/command-menu";
import { tools } from "@imagetools/tools";
import { getIcon } from "@/lib/icon-map";

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar variant="floating">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
										<Image className="size-4" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">imagetools</span>
									</div>
									<ChevronDown className="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width] min-w-56">
								<DropdownMenuItem asChild>
									<a
										href="https://github.com/eliasnau/imagetools"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2"
									>
										<Github className="size-4" />
										<span>Star on GitHub</span>
									</a>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<div className="px-2 py-1">
						<CommandSearchBar />
					</div>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={pathname === "/tools"}>
									<Link href="/tools">
										<LayoutGrid className="size-4" />
										<span>All Tools</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Tools</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{tools.map((tool) => {
								const Icon = getIcon(tool.icon);
								const isActive = pathname === `/tools/${tool.id}`;

								return (
									<SidebarMenuItem key={tool.id}>
										<SidebarMenuButton asChild isActive={isActive}>
											<Link href={`/tools/${tool.id}`}>
												<Icon className="size-4" />
												<span>{tool.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}

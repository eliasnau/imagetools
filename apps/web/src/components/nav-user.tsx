"use client";

import { useUser, SignInButton, useClerk } from "@clerk/nextjs";
import { ChevronsUpDown, LogIn, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavUser() {
	const { user, isSignedIn, isLoaded } = useUser();
	const { signOut, openUserProfile } = useClerk();

	if (!isLoaded) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size="lg" disabled>
						<Skeleton className="h-8 w-8 rounded-lg shrink-0" />
						<div className="grid flex-1 gap-1.5 text-left">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-3 w-32" />
						</div>
						<Skeleton className="h-4 w-4 ml-auto" />
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	if (!isSignedIn) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SignInButton mode="modal">
						<SidebarMenuButton size="lg">
							<LogIn className="size-4" />
							<span>Sign In</span>
						</SidebarMenuButton>
					</SignInButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
								<AvatarFallback className="rounded-lg">
									{user?.fullName?.charAt(0) || "U"}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{user?.fullName || "User"}
								</span>
								<span className="truncate text-xs">
									{user?.primaryEmailAddress?.emailAddress || ""}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
						side="top"
						align="end"
					>
						<DropdownMenuItem onClick={() => openUserProfile()}>
							<Settings className="size-4" />
							<span>Account Settings</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => signOut()}>
							<LogOut className="size-4" />
							<span>Sign Out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

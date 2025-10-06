"use client";
import * as React from "react";
import { useRouter } from "nextjs-toploader/app";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "./ui/command";
import { tools } from "@imagetools/tools";
import { Search } from "lucide-react";
import { InputGroup, InputGroupInput, InputGroupAddon } from "./ui/input-group";

import { useClerk } from "@clerk/nextjs";
import { Kbd } from "./ui/kbd";
import { getIcon } from "@/lib/icon-map";

export function CommandMenu() {
	const [open, setOpen] = React.useState(false);
	const router = useRouter();

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setOpen((o) => !o);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const groups = React.useMemo(() => {
		const grouped: Record<string, typeof tools> = {};
		for (const t of tools) {
			const g = t.group || "General";
			grouped[g] ||= [] as any;
			grouped[g].push(t);
		}
		return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
	}, []);

	const { isSignedIn, signOut } = useClerk();

	const actions = React.useMemo(
		() => [
			{
				id: "sign-in",
				title: "Sign In",
				description: "Authenticate and access your account",
				keywords: "login authenticate",
				icon: "LogIn",
				group: "Auth",
				href: "/sign-in",
				unauthOnly: true,
			},
			{
				id: "sign-up",
				title: "Sign Up",
				description: "Create a new imagetools account",
				keywords: "register create account",
				icon: "UserPlus",
				group: "Auth",
				href: "/sign-up",
				unauthOnly: true,
			},
			{
				id: "sign-out",
				title: "Sign Out",
				description: "End your current session",
				keywords: "logout signout",
				icon: "LogOut",
				group: "Auth",
				requiresAuth: true,
				run: async () => {
					await signOut();
				},
			},
			{
				id: "github",
				title: "View Source Code on GitHub",
				description: "Open the project repository",
				keywords: "github source code repository",
				icon: "Github",
				group: "Project",
				href: "https://github.com/eliasnau/imagetools",
			},
		],
		[signOut],
	);

	const visibleActions = React.useMemo(
		() =>
			actions.filter((a) => {
				if (a.requiresAuth && !isSignedIn) return false;
				if (a.unauthOnly && isSignedIn) return false;
				return true;
			}),
		[isSignedIn, actions],
	);

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<Command>
				<CommandInput placeholder="Search tools..." />
				<CommandList>
					<CommandEmpty>No tools found.</CommandEmpty>
					{groups.map(([group, items]) => (
						<CommandGroup key={group} heading={group}>
							{items.map((item) => {
								const Icon = getIcon(item.icon);
								return (
									<CommandItem
										key={item.id}
										value={`${item.title} ${item.keywords || ""}`}
										onSelect={() => {
											setOpen(false);
											router.push(`/tools/${item.id}` as any);
										}}
									>
										<Icon size={16} className="shrink-0" />
										<span>{item.title}</span>
										{item.description && (
											<span className="ml-auto pl-2 text-xs text-muted-foreground line-clamp-1">
												{item.description}
											</span>
										)}
									</CommandItem>
								);
							})}
						</CommandGroup>
					))}
					<CommandSeparator />
					<CommandGroup heading="Actions">
						{visibleActions.map((action) => {
							const Icon = getIcon(action.icon);
							return (
								<CommandItem
									key={action.id}
									value={`${action.title} ${action.keywords || ""}`}
									onSelect={async () => {
										setOpen(false);
										if (action.run) {
											await action.run();
										} else if (action.href) {
											if (action.href.startsWith("http")) {
												window.open(action.href, "_blank");
											} else {
												router.push(action.href as any);
											}
										}
									}}
								>
									<Icon size={16} className="shrink-0" />
									<span>{action.title}</span>
									{action.description && (
										<span className="ml-auto pl-2 text-xs text-muted-foreground line-clamp-1">
											{action.description}
										</span>
									)}
								</CommandItem>
							);
						})}
					</CommandGroup>
				</CommandList>
			</Command>
		</CommandDialog>
	);
}

export function CommandSearchBar() {
	return (
		<div
			className="cursor-pointer"
			onClick={() => {
				const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true });
				document.dispatchEvent(ev);
			}}
		>
			<InputGroup>
				<InputGroupInput placeholder="Search..." disabled />
				<InputGroupAddon>
					<Search />
				</InputGroupAddon>
				<InputGroupAddon align="inline-end">
					<Kbd>⌘K</Kbd>
				</InputGroupAddon>
			</InputGroup>
		</div>
	);
}

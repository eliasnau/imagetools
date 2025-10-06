import type { CommandAction } from "./types";

export const commandActions: CommandAction[] = [
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
];

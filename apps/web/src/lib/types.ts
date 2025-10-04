export interface CommandAction {
	id: string;
	title: string;
	description?: string;
	keywords?: string;
	icon?: string;
	group?: string;
	href?: string; // internal or external navigation target
	requiresAuth?: boolean; // visible only when authenticated
	unauthOnly?: boolean; // visible only when NOT authenticated
	// run?: () => void | Promise<void>; // future extension
}

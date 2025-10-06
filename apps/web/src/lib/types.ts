export interface CommandAction {
	id: string;
	title: string;
	description?: string;
	keywords?: string;
	icon?: string;
	group?: string;
	href?: string;
	run?: () => void | Promise<void>;
	requiresAuth?: boolean;
	unauthOnly?: boolean;
}

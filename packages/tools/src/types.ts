export interface CommandTool {
	id: string;
	title: string;
	description?: string; 
	keywords?: string;
	icon?: string; 
	group?: string;
}

export type CommandRegistry = CommandTool[];

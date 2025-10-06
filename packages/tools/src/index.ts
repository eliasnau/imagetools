export * from "./types";
export * from "./convert";
export * from "./roundCorners";
export * from "./metadata";

// Registry helper
import type { CommandRegistry } from "./types";
import { convertTool } from "./convert";
import { roundCornersTool } from "./roundCorners";
import { metadataTool } from "./metadata";

export const tools: CommandRegistry = [
	convertTool,
	roundCornersTool,
	metadataTool,
];

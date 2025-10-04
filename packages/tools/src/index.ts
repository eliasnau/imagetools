export * from "./types";
export * from "./convert";
export * from "./roundCorners";

// Registry helper
import type { CommandRegistry } from "./types";
import { convertTool } from "./convert";
import { roundCornersTool } from "./roundCorners";

export const tools: CommandRegistry = [convertTool, roundCornersTool];

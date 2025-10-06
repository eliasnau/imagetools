import type { CommandTool } from "./types";

export const metadataTool: CommandTool = {
	id: "metadata",
	title: "Metadata Viewer",
	description: "Inspect and strip basic image metadata (EXIF).",
	keywords: "exif metadata strip remove privacy",
	icon: "Info",
	group: "Analysis",
};

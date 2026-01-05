import type { KnipConfig } from "knip";

export default {
	ignore: [
		"src/convex/auth.ts", // Used by Convex
		"src/convex/auth.config.ts", // Used by Convex
		"src/convex/_generated/*", // Generated code
	],
} satisfies KnipConfig;

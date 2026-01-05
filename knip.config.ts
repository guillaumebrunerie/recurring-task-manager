import type { KnipConfig } from "knip";

export default {
	entry: [
		"src/service-worker/sw.ts", // Service worker
	],
	ignore: [
		"src/convex/auth.ts", // Used by Convex
		"src/convex/auth.config.ts", // Used by Convex
		"src/convex/_generated/*", // Generated code
	],
	ignoreDependencies: [],
} satisfies KnipConfig;

import type { KnipConfig } from "knip";

export default {
	entry: [
		"public/sw.js", // Service worker
	],
	ignore: [
		"src/convex/auth.ts", // Used by Convex
		"src/convex/auth.config.ts", // Used by Convex
		"src/convex/_generated/*", // Generated code
	],
	ignoreDependencies: ["eslint-config-next"],
} satisfies KnipConfig;

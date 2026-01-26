import type { KnipConfig } from "knip";

export default {
	ignore: [
		"src/convex/auth.ts", // Used by Convex
		"src/convex/auth.config.ts", // Used by Convex
		"src/convex/_generated/*", // Generated code
		"src/service-worker/env.d.ts", // Type declarations
	],
} satisfies KnipConfig;

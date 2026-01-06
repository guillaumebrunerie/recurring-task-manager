import type { Config } from "prettier";

const config: Config = {
	useTabs: true,
	tabWidth: 4,
	experimentalTernaries: true,
	objectWrap: "collapse",
	plugins: ["@ianvs/prettier-plugin-sort-imports"],
	importOrder: [
		"<THIRD_PARTY_MODULES>",
		"",
		"^(@/convex|./_generated)/(.*)$",
		"",
		"^@/shared/(.*)$",
		"",
		"^@/(.*)$",
		"",
		"^[./]",
	],
	importOrderTypeScriptVersion: "5.9.0",
};

export default config;

import { defineConfig } from "oxlint";

export default defineConfig({
	categories: { correctness: "error", suspicious: "error" },
	plugins: [
		"eslint",
		"typescript",
		"unicorn",
		"react",
		"react-perf",
		"nextjs",
		"oxc",
		"import",
		"node",
		"promise",
	],
	rules: {
		"no-process-env": "error",
		"no-shadow": "off",
		"no-unassigned-import": [
			"error",
			{ allow: ["**/*.css", "server-only"] },
		],
		"no-unsafe-type-assertion": "off",
		"react-in-jsx-scope": "off",
	},
	options: { typeAware: true },
});

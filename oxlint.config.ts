import { defineConfig } from "oxlint";

export default defineConfig({
	categories: { correctness: "error", suspicious: "error" },
	plugins: ["node"],
	rules: {
		"no-process-env": "error",
		"no-shadow": "off",
		"no-unsafe-type-assertion": "off",
	},
	options: { typeAware: true },
});

import { defineConfig } from "oxlint";

export default defineConfig({
	categories: {
		correctness: "error",
		suspicious: "error",
		// pedantic: "error",
		// perf: "error",
		// style: "error",
		// restriction: "error",
		// nursery: "error",
	},
	rules: {},
});

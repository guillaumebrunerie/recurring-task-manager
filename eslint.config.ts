import { defineConfig, globalIgnores, type Config } from "eslint/config";
import convexPlugin from "@convex-dev/eslint-plugin";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig(
	// Main rules
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
	},
	convexPlugin.configs.recommended as Config,
	...(nextVitals as Config[]),
	{
		rules: {
			"@typescript-eslint/restrict-template-expressions": [
				"error",
				{ allowNumber: true },
			],
			"@typescript-eslint/no-confusing-void-expression": [
				"error",
				{ ignoreArrowShorthand: true },
			],
		},
	},
	{
		files: ["**/*.config.*"],
		rules: {
			"import/no-anonymous-default-export": "off",
		},
	},
	// Ignores
	globalIgnores([
		"src/convex/_generated",
		"node_modules/**",
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts",
	]),
);

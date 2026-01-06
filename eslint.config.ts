import convexPlugin from "@convex-dev/eslint-plugin";
import eslint from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
	// Main configs
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	{ languageOptions: { parserOptions: { projectService: true } } },
	convexPlugin.configs.recommended,
	...nextVitals,
	// Overrides
	{
		rules: {
			"@typescript-eslint/restrict-template-expressions": [
				"error",
				{
					allowAny: false,
					allowBoolean: true,
					allowNever: false,
					allowNullish: false,
					allowNumber: true,
					allowRegExp: false,
				},
			],
			"@typescript-eslint/no-confusing-void-expression": [
				"error",
				{ ignoreArrowShorthand: true },
			],
		},
	},
	// Ignores
	globalIgnores(["src/convex/_generated", "public/sw.js"]),
]);

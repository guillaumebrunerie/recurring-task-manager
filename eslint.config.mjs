import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { globalIgnores } from "eslint/config";
import convexPlugin from "@convex-dev/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

export default [
	{
		ignores: [
			"node_modules/**",
			".next/**",
			"out/**",
			"build/**",
			"next-env.d.ts",
		],
	},
	globalIgnores(["src/convex/_generated"]),
	...convexPlugin.configs.recommended,
	...compat.config({
		extends: ["next/core-web-vitals", "next/typescript"],
		rules: {
			"@next/next/no-img-element": "off",
		},
	}),
	{
		files: ["**/*.config.*"],
		rules: {
			"import/no-anonymous-default-export": "off",
		},
	},
];

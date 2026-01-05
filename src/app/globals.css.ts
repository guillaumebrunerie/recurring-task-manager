import { globalStyle } from "@vanilla-extract/css";

import { colors } from "./themes.css";

globalStyle(":root", {
	colorScheme: "light",
	color: colors.foreground,
	background: colors.background,
	fontFamily: "Arial, Helvetica, sans-serif",
	WebkitFontSmoothing: "antialiased",
	MozOsxFontSmoothing: "grayscale",
});

globalStyle("html, body", {
	maxWidth: "100vw",
	overflowX: "hidden",
	height: "100%",
});

globalStyle("*", { boxSizing: "border-box", padding: 0, margin: 0 });

globalStyle("a", { color: "inherit", textDecoration: "none" });

// /* @media (prefers-color-scheme: dark) { */
// /* 	:root { */
// /* 		--background: #0a0a0a; */
// /* 		--foreground: #ededed; */
// /* 	} */
// /* } */

// /* @media (prefers-color-scheme: dark) { */
// /* 	html { */
// /* 		color-scheme: dark; */
// /* 	} */
// /* } */

import { style } from "@vanilla-extract/css";

import { colors } from "./themes.css";

export const loading = style({
	fontSize: "1.2rem",
	textAlign: "center",
	color: "#555",
	padding: "2rem 0",
});

export const title = style({
	fontSize: "1.5rem",
	fontWeight: 600,
	color: colors.hfforeground,
});

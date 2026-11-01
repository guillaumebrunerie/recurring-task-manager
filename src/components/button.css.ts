import { style } from "@vanilla-extract/css";

import { colors } from "@/app/themes.css";

const button = style({
	padding: "0.5rem 0.75rem",
	color: colors.buttonText,
	border: "none",
	borderRadius: "8px",
	cursor: "pointer",
	fontSize: "1rem",
	whiteSpace: "nowrap",
	WebkitTapHighlightColor: "transparent",
});

export const greenButton = style([
	button,
	{
		":hover": { backgroundColor: "#158a1a" },
		backgroundColor: colors.doneButton,
	},
]);

export const lightGreenButton = style([
	button,
	{ ":hover": { backgroundColor: "#2f7f5d" }, backgroundColor: "#3d9d75" },
]);

export const blueButton = style([
	button,
	{
		":hover": { backgroundColor: "#005fa3" },
		backgroundColor: colors.editButton,
	},
]);

export const redButton = style([
	button,
	{ ":hover": { backgroundColor: "#a82a2a" }, backgroundColor: "#c43737" },
]);

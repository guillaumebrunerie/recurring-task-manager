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

export const blueButton = style([
	button,
	{
		":hover": { backgroundColor: "#005fa3" },
		backgroundColor: colors.editButton,
	},
]);

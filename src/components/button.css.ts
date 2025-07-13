import { style } from "@vanilla-extract/css";

const button = style({
	padding: "0.5rem 0.75rem",
	color: "white",
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
		":hover": {
			backgroundColor: "#158a1a",
		},
		backgroundColor: "#4CAF50",
	},
]);

export const blueButton = style([
	button,
	{
		":hover": {
			backgroundColor: "#005fa3",
		},
		backgroundColor: "#0077cc",
	},
]);

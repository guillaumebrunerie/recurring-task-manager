import { style } from "@vanilla-extract/css";

export const container = style({
	backgroundColor: "#f9fafb",
	height: "100%",
});

export const backButton = style({
	position: "fixed",
	background: "none",
	border: "none",
	color: "#333",
	fontSize: "1rem",
	padding: "2rem 0.5rem",
	cursor: "pointer",
	fontWeight: "bold",
	":hover": {
		color: "#000",
	},
});

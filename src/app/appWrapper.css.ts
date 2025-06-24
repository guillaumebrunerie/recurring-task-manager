import { style } from "@vanilla-extract/css";

export const container = style({
	height: "100%",
	display: "grid",
	gridTemplateRows: "4rem 1fr auto",
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
	left: "calc((4rem - 40px) / 2)",
});

export const header = style({
	backgroundColor: "#f9fafb",
	borderBottom: "1px solid #e5e7eb",
	display: "grid",
	placeItems: "center",
	boxShadow: "0 3px 3px rgba(0, 0, 0, 0.1)",
	zIndex: 1,
});

export const footer = style({
	display: "grid",
	backgroundColor: "#f9fafb",
	borderTop: "1px solid #e5e7eb",
	placeItems: "end",
	alignItems: "center",
	padding: "1rem",
	paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
	boxShadow: "0 -3px 3px rgba(0, 0, 0, 0.1)",
	zIndex: 1,
});

export const contents = style({
	overflow: "auto",
});

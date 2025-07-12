import { style } from "@vanilla-extract/css";

export const formWrapper = style({
	display: "flex",
	flexDirection: "column",
	padding: "1rem",
	gap: "1.2rem",
	maxWidth: "500px",
	margin: "0 auto",
});

export const heading = style({
	fontSize: "1.5rem",
	fontWeight: 600,
	marginBottom: "0.5rem",
	textAlign: "center",
});

export const label = style({
	fontSize: "0.95rem",
	fontWeight: "bold",
	color: "#333",
});

export const input = style({
	padding: "0.5rem",
	fontSize: "1rem",
	border: "1px solid #ccc",
	borderRadius: "6px",
	width: "100%",
	background: "#fff",
	color: "#111",
	"&:disabled": {
		opacity: 0.5,
	},
});

export const checkboxLabel = style({
	padding: "0.25rem 0",
	display: "flex",
	alignItems: "center",
	gap: "0.5rem",
	cursor: "pointer",
});

export const textarea = style([
	input,
	{
		fontFamily: "inherit",
		minHeight: "100px",
		fieldSizing: "content",
		resize: "none",
	},
]);

export const periodRow = style({
	display: "flex",
	alignItems: "center",
	gap: "0.5rem",
});

export const button = style({
	alignSelf: "flex-end",
	padding: "0.6rem 1rem",
	backgroundColor: "#0077cc",
	color: "#fff",
	border: "none",
	borderRadius: "8px",
	fontSize: "1rem",
	textDecoration: "none",
});

export const field = style({
	display: "flex",
	flexDirection: "column",
	gap: "0.3rem",
});

export const addTaskButton = style({
	padding: "0.6rem 1rem",
	backgroundColor: "#0077cc",
	color: "#fff",
	border: "none",
	borderRadius: "8px",
	fontSize: "1rem",
	textDecoration: "none",
	cursor: "pointer",
});

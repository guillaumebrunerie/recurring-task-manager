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
	fontWeight: 500,
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
});

export const textarea = style([
	input,
	{
		minHeight: "100px",
		resize: "vertical",
	},
]);

export const periodRow = style({
	display: "flex",
	gap: "0.5rem",
});

export const button = style({
	backgroundColor: "#4CAF50",
	color: "white",
	padding: "0.75rem 1.25rem",
	fontSize: "1rem",
	border: "none",
	borderRadius: "8px",
	cursor: "pointer",
	alignSelf: "center",
});

export const field = style({
	display: "flex",
	flexDirection: "column",
	gap: "0.3rem",
});

export const backButton = style({
	position: "fixed",
	background: "none",
	border: "none",
	color: "#333",
	fontSize: "1rem",
	padding: "0.5rem 0",
	cursor: "pointer",
	fontWeight: "bold",
	":hover": {
		color: "#000",
	},
});

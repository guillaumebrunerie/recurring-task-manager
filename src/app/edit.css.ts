import { style } from "@vanilla-extract/css";

export const formWrapper = style({
	display: "flex",
	flexDirection: "column",
	gap: "1.2rem",
	maxWidth: "500px",
	margin: "0 auto",
	width: "100%",
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
	fieldSizing: "content",
	flexGrow: 1,
	// width: "100%",
	background: "#fff",
	color: "#111",
	"&:disabled": {
		opacity: 0.5,
	},
});

export const inputSmall = style({
	padding: "0.5rem",
	fontSize: "1rem",
	border: "1px solid #ccc",
	borderRadius: "6px",
	fieldSizing: "content",
	flexGrow: 2,
	// maxWidth: "40%",
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

export const field = style({
	display: "flex",
	flexDirection: "column",
	gap: "0.3rem",
});

export const bottomBar = style({
	display: "flex",
	justifyContent: "flex-end",
});

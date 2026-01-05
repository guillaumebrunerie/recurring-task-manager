import { style } from "@vanilla-extract/css";

export const grid = style({
	display: "flex",
	flexWrap: "wrap",
	gap: "0.5rem",
	marginTop: "0.5rem",
});

export const user = style({
	display: "flex",
	alignItems: "center",
	gap: "0.5rem",
	padding: "0.5rem 0.75rem",
	borderRadius: "0.5rem",
	border: "1px solid #ccc",
	backgroundColor: "white",
	cursor: "pointer",
	transition: "background-color 0.2s, border-color 0.2s",
});

export const selected = style({
	backgroundColor: "#e0f2ff",
	borderColor: "#3b82f6",
});

export const primary = style({
	backgroundColor: "#aedbfb",
	borderColor: "#3b82f6",
});

export const avatar = style({ borderRadius: "50%", objectFit: "cover" });

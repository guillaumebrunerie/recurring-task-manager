import { style } from "@vanilla-extract/css";

export const overlay = style({
	position: "fixed",
	inset: 0,
	backgroundColor: "rgba(0, 0, 0, 0.4)",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	zIndex: 1000,
	cursor: "pointer",
});

export const modalOverlay = style({
	position: "fixed",
	inset: 0,
	backgroundColor: "rgba(0, 0, 0, 0.4)",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	zIndex: 1000,
});

export const modalContent = style({
	backgroundColor: "#ffffff",
	borderRadius: "16px",
	padding: "1.5rem",
	width: "90%",
	maxWidth: "420px",
	maxHeight: "90vh",
	overflowY: "auto",
	boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
	position: "relative",
	color: "#1c1c1e",
	cursor: "default",
});

export const modalHeader = style({
	display: "flex",
	gap: "0.5rem",
	alignItems: "start",
	justifyContent: "space-between",
	fontSize: "1.2rem",
	fontWeight: 600,
});

export const closeButton = style({
	background: "none",
	border: "none",
	fontSize: "1.25rem",
	cursor: "pointer",
	color: "#888",
	":hover": {
		color: "#000",
	},
});

import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const card = style({
	padding: "1rem",
	borderRadius: "12px",
	boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
	fontSize: "1rem",
});

export const name = style({
	fontWeight: "bold",
	fontSize: "1.1rem",
});

export const time = style({
	fontSize: "0.9rem",
	textAlign: "right",
});

export const statusVariants = recipe({
	base: {
		borderLeft: "4px solid",
		marginBlock: "4px",
	},
	variants: {
		status: {
			new: {
				backgroundColor: "#f0faff",
				borderColor: "#0077cc",
				color: "#004a99",
			},
			overdue: {
				backgroundColor: "#fff0f0",
				borderColor: "#cc0000",
				color: "#990000",
			},
			due: {
				backgroundColor: "#fffce0",
				borderColor: "#e0b000",
				color: "#665500",
			},
			waiting: {
				backgroundColor: "#f4f4f4",
				borderColor: "#cccccc",
				color: "#666666",
			},
		},
	},
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
	boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
	position: "relative",
	color: "#1c1c1e",
});

export const modalHeader = style({
	fontSize: "1.2rem",
	fontWeight: 600,
});

export const closeButton = style({
	position: "absolute",
	top: "1rem",
	right: "1rem",
	background: "none",
	border: "none",
	fontSize: "1.25rem",
	cursor: "pointer",
	color: "#888",
	":hover": {
		color: "#000",
	},
});

export const label = style({
	fontSize: "0.95rem",
	fontWeight: 500,
});

export const input = style({
	appearance: "none",
	WebkitAppearance: "none",
	MozAppearance: "textfield", // for Firefox

	padding: "0.5rem",
	fontSize: "1rem",
	borderRadius: "6px",
	border: "1px solid #ccc",
	backgroundColor: "#fff",
	color: "#111",
	width: "100%",
	marginTop: "0.5rem",

	selectors: {
		"&:focus": {
			outline: "none",
			borderColor: "#888",
			boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.1)",
		},
		"&::-webkit-datetime-edit-fields-wrapper": {
			backgroundColor: "#fff",
		},
		"&::-webkit-datetime-edit": {
			color: "#111",
		},
		"&::-webkit-clear-button, &::-webkit-inner-spin-button": {
			display: "none",
		},
	},
});

export const modalButtons = style({
	display: "flex",
	justifyContent: "flex-end",
	gap: "0.75rem",
	marginTop: "0.5rem",
});

export const primaryButton = style({
	padding: "0.5rem 1rem",
	backgroundColor: "#0077cc",
	color: "white",
	border: "none",
	borderRadius: "8px",
	cursor: "pointer",
	fontWeight: 500,
	":hover": {
		backgroundColor: "#005fa3",
	},
});

export const secondaryButton = style({
	padding: "0.5rem 1rem",
	backgroundColor: "#eeeeee",
	color: "#333",
	border: "none",
	borderRadius: "8px",
	cursor: "pointer",
	fontWeight: 500,
	":hover": {
		backgroundColor: "#dddddd",
	},
});

export const overlay = style({
	position: "fixed",
	inset: 0,
	backgroundColor: "rgba(0, 0, 0, 0.4)",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	zIndex: 1000,
});

export const section = style({
	marginTop: "1rem",
	borderTop: "1px solid #eee",
	paddingTop: "1rem",
});

export const sectionTitle = style({
	fontSize: "1rem",
	fontWeight: 600,
	marginBottom: "0.5rem",
	color: "#555",
});

export const completionList = style({
	listStyle: "none",
	padding: 0,
	margin: 0,
	display: "flex",
	flexDirection: "column",
	gap: "0.25rem",
});

export const completionItem = style({
	fontSize: "0.9rem",
	color: "#333",
	padding: "0.4rem 0.6rem",
	backgroundColor: "#f6f6f6",
	borderRadius: "8px",
});
export const taskPage = style({
	display: "flex",
	flexDirection: "column",
	gap: "2rem",
	padding: "1rem",
});

export const section2 = style({
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
});

export const sectionTitle2 = style({
	fontSize: "1.2rem",
	fontWeight: 600,
	color: "#222",
	marginBottom: "0.5rem",
});

export const taskList = style({
	display: "flex",
	flexDirection: "column",
	gap: "0.75rem",
});

export const otherSection = style({
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
});

export const toggleOther = style({
	alignSelf: "flex-start",
	background: "none",
	border: "none",
	color: "#555",
	cursor: "pointer",
	fontSize: "0.95rem",
	textDecoration: "underline",
	padding: 0,
});

export const addTaskButton = style({
	alignSelf: "flex-end",
	padding: "0.6rem 1rem",
	backgroundColor: "#4CAF50",
	color: "#fff",
	border: "none",
	borderRadius: "8px",
	fontSize: "1rem",
	textDecoration: "none",
});

export const editButton = style({
	fontSize: "1rem",
	background: "none",
	border: "none",
	cursor: "pointer",
	color: "#555",
	display: "inline-block",
	transform: "scaleX(-1)",
	textDecoration: "none",
	":hover": {
		color: "#000",
	},
});

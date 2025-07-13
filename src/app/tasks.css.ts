import { createVar, keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const card = style({
	position: "relative",
	padding: "0.8rem 1rem",
	borderRadius: "12px",
	boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
	fontSize: "1rem",
	cursor: "pointer",
	"-webkit-tap-highlight-color": "transparent",
});

export const name = style({
	fontWeight: "bold",
	fontSize: "1.1rem",
});

export const time = style({
	fontSize: "0.9rem",
	textAlign: "right",
});

export const lock = style({});

export const assignee = style({
	width: "24px",
	height: "24px",
	borderRadius: "50%",
	objectFit: "cover",
});

export const topRow = style({
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
});

export const bottomRow = style({
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
});

export const statusVariants = recipe({
	base: {
		borderLeft: "4px solid",
		marginBlock: "4px",
	},
	variants: {
		status: {
			overdue: {
				backgroundColor: "#fff0f0",
				borderColor: "#cc0000",
				color: "#990000",
			},
			due: {
				backgroundColor: "#f0faff",
				borderColor: "#0077cc",
				color: "#004a99",
			},
			new: {
				backgroundColor: "#f0faff",
				borderColor: "#0077cc",
				color: "#004a99",
			},
			waiting: {
				backgroundColor: "#f0fff5",
				borderColor: "#2e8b57",
				color: "#1e4d2b",
			},
			archived: {
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
	maxHeight: "90vh",
	overflowY: "auto",
	boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
	position: "relative",
	color: "#1c1c1e",
});

export const modalHeader = style({
	display: "flex",
	gap: "0.5rem",
	alignItems: "start",
	justifyContent: "space-between",
	fontSize: "1.2rem",
	fontWeight: 600,
});

export const description = style({
	whiteSpace: "pre-wrap",
});

export const interval = style({
	fontStyle: "italic",
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
	justifyContent: "end",
	gap: "0.8rem",
});

export const modalButtons2 = style({
	display: "flex",
	justifyContent: "space-between",
	gap: "0.5rem",
});

export const primaryButton = style({
	padding: "0.5rem 0.75rem",
	backgroundColor: "#4CAF50",
	color: "white",
	border: "none",
	borderRadius: "8px",
	cursor: "pointer",
	fontSize: "1rem",
	whiteSpace: "nowrap",
	":hover": {
		backgroundColor: "#158a1a",
	},
	"-webkit-tap-highlight-color": "transparent",
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
	borderTop: "1px solid #eee",
	paddingTop: "1rem",
});

export const sectionTitle = style({
	fontSize: "1rem",
	fontWeight: 600,
	marginBottom: "0.5rem",
	color: "#555",
});

export const optionsSection = style({});

export const optionsButton = recipe({
	base: {
		display: "flex",
		justifyContent: "end",
		alignItems: "center",
		gap: "0.25rem",
		cursor: "pointer",
		transition: "color 0.3s ease",
	},
	variants: {
		isCollapsed: {
			true: {
				color: "#888",
			},
			false: {
				color: "currentColor",
			},
		},
	},
});

export const options = recipe({
	base: {
		overflow: "hidden",
		interpolateSize: "allow-keywords",
		transition: `height 0.3s ease`,
		boxSizing: "border-box",
		"::before": {
			content: "",
			display: "block",
			height: "1rem",
		},
	},
	variants: {
		isCollapsed: {
			true: {
				height: "0",
			},
			false: {
				height: "auto",
			},
		},
	},
});

export const completionList = style({
	listStyle: "none",
	padding: 0,
	margin: 0,
	display: "flex",
	flexDirection: "column",
	gap: "0.25rem",
	overflow: "auto",
	maxHeight: "40vh",
});

export const completionItem = style({
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	fontSize: "0.9rem",
	color: "#333",
	padding: "0.4rem 0.6rem",
	backgroundColor: "#f6f6f6",
	borderRadius: "8px",
	cursor: "pointer",
	"-webkit-tap-highlight-color": "transparent",
});

export const accomplishedBy = style({
	width: "20px",
	height: "20px",
	borderRadius: "50%",
	objectFit: "cover",
});

export const taskPage = style({
	display: "flex",
	flexDirection: "column",
	gap: "0.8rem",
	padding: "1rem",
	paddingBottom: "3rem",
});

export const section2 = style({
	display: "flex",
	flexDirection: "column",
});

export const sectionTitle2 = style({
	fontSize: "1.2rem",
	fontWeight: 600,
	color: "#222",
	marginBottom: "0.7rem",
	cursor: "pointer",
});

export const arrow = recipe({
	base: {
		display: "inline-block",
		transition: "rotate 0.3s ease",
	},
	variants: {
		isCollapsed: {
			true: {
				rotate: "-90deg",
			},
			false: {},
		},
	},
	defaultVariants: {
		isCollapsed: false,
	},
});

export const collapseDelayVar = createVar();
export const taskList = recipe({
	base: {
		display: "flex",
		flexDirection: "column",
		gap: "0.75rem",
		interpolateSize: "allow-keywords",
		transition: `all ${collapseDelayVar} ease`,
		overflow: "hidden",
	},
	variants: {
		isCollapsed: {
			true: {
				height: "0",
			},
		},
		fullyOpen: {
			true: {
				overflow: "visible",
			},
		},
	},
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
	padding: "0.6rem 1rem",
	backgroundColor: "#0077cc",
	color: "#fff",
	border: "none",
	borderRadius: "8px",
	fontSize: "1rem",
	textDecoration: "none",
});

export const editButton = style({
	padding: "0.6rem 1rem",
	backgroundColor: "#0077cc",
	color: "#fff",
	border: "none",
	borderRadius: "8px",
	fontSize: "1rem",
	textDecoration: "none",
});

export const infoRow = style({
	display: "flex",
	justifyContent: "space-between",
	alignItems: "end",
	gap: "0.5rem",
});

export const stuff = style({
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
});

export const threeDots = style({
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	gap: "3px",
	width: "12px",
	height: "24px",
	cursor: "pointer",
});

export const dot = style({
	width: "3px",
	height: "3px",
	backgroundColor: "currentColor",
	borderRadius: "50%",
	flex: "none",
});

export const contextMenu = style({
	zIndex: 10000,
	color: "var(--foreground)",
	position: "absolute",
	top: "40px",
	right: "10px",
	backgroundColor: "white",
	border: "1px solid #ddd",
	borderRadius: "0.5rem",
	boxShadow: "3px 4px 6px rgba(0, 0, 0, 0.2)",
	minWidth: "150px",
	overflow: "hidden",
});

export const contextMenuItem = style({
	display: "block",
	padding: "0.5rem 1rem",
	fontSize: "0.95rem",
	cursor: "pointer",
	selectors: {
		"&:hover": {
			backgroundColor: "#f1f1f1",
		},
	},
});

export const warningText = style({
	fontWeight: "bold",
	color: "#cc0000",
});

export const separator = style({
	marginBlock: "0.25rem",
});

const spin = keyframes({
	to: { transform: "rotate(360deg)" },
});

export const spinner = style({
	width: "1em",
	height: "1em",
	border: "2px solid currentColor",
	borderTopColor: "transparent",
	borderRadius: "50%",
	animation: `${spin} 1.2s linear infinite`,
	display: "inline-block",
	verticalAlign: "middle",
	marginRight: "0.5rem",
});

export const deleteHistoryItem = style({
	display: "flex",
	whiteSpace: "nowrap",
});

export const deleteHistoryItemButton = recipe({
	base: {
		width: 0,
		interpolateSize: "allow-keywords",
		transition: "all 0.2s ease",
		overflow: "hidden",
		marginRight: 0,
		fontWeight: "bold",
		color: "#cc0000",
	},
	variants: {
		showDeleteButton: {
			true: {
				width: "auto",
				marginRight: "1ch",
			},
		},
	},
});

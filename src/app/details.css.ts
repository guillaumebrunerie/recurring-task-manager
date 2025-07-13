import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const description = style({
	whiteSpace: "pre-wrap",
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

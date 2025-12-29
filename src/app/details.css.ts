import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { colors } from "./themes.css";

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
	border: "1px solid",
	borderColor: colors.hfborder,
	backgroundColor: colors.background,
	color: colors.foreground,
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

export const section = style({
	borderTop: "1px solid #eee",
	paddingTop: "1rem",
});

export const sectionTitle = style({
	fontSize: "1rem",
	fontWeight: 600,
	marginBottom: "0.5rem",
	color: colors.detailsSection,
});

export const optionsSection = style({});

export const historySection = style({
	borderTop: "1px solid #eee",
	paddingTop: "1rem",
	display: "flex",
	flexDirection: "column",
});

export const optionsButton = recipe({
	base: {
		display: "flex",
		justifyContent: "flex-end",
		alignItems: "center",
		gap: "0.25rem",
		cursor: "pointer",
		transition: "color 0.3s ease",
		fontWeight: "500",
	},
	variants: {
		isCollapsed: {
			true: {
				color: colors.detailsSection,
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
		display: "grid",
		gap: "0.5rem",
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

export const history = recipe({
	base: {
		overflow: "hidden",
		interpolateSize: "allow-keywords",
		transition: `all 0.3s ease`,
		boxSizing: "border-box",
		display: "grid",
		gap: "0.5rem",
		paddingTop: "1rem",
	},
	variants: {
		isCollapsed: {
			true: {
				height: "0",
				paddingTop: "0",
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
	padding: "0.4rem 0.6rem",
	backgroundColor: colors.accomplishment.background,
	borderRadius: "8px",
	cursor: "pointer",
	// whiteSpace: "nowrap",
	// textOverflow: "ellipsis",
	// overflow: "hidden",
	// flex: "none",
	"-webkit-tap-highlight-color": "transparent",
});

export const failedCompletionItem = style({
	opacity: 0.5,
	textDecoration: "line-through",
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

export const infoRow = style({
	display: "flex",
	justifyContent: "space-between",
	alignItems: "flex-end",
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
		color: colors.deleteButton,
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

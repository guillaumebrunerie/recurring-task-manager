import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { colors } from "./themes.css";

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
		status: colors.cardStatus,
	},
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
	color: colors.foreground,
	position: "absolute",
	top: "40px",
	right: "10px",
	backgroundColor: colors.hfbackground,
	border: "1px solid",
	borderColor: colors.hfborder,
	borderRadius: "0.5rem",
	boxShadow: `3px 4px 6px ${colors.hfshadow}`,
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
			backgroundColor: colors.hfbackgroundhover,
		},
	},
});

export const warningText = style({
	fontWeight: "bold",
	color: colors.contextMenu.warning,
});

export const separator = style({
	marginBlock: "0.25rem",
});

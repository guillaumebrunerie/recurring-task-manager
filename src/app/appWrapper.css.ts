import { style } from "@vanilla-extract/css";
import { colors } from "./themes.css";

export const container = style({
	height: "100%",
	display: "grid",
	gridTemplateRows: "4rem 1fr auto",
});

export const backButton = style({
	position: "fixed",
	background: "none",
	border: "none",
	//	color: "#333",
	fontSize: "1rem",
	padding: "2rem 0.5rem",
	cursor: "pointer",
	fontWeight: "bold",
	// ":hover": {
	// 	color: "#000",
	// },
	left: "calc((4rem - 40px) / 2)",
});

export const header = style({
	backgroundColor: colors.hfbackground,
	borderBottom: "1px solid",
	borderColor: colors.hfborder,
	display: "grid",
	placeItems: "center",
	boxShadow: `0 3px 3px ${colors.hfshadow}`,
	zIndex: 1,
});

export const footer = style({
	display: "grid",
	backgroundColor: colors.hfbackground,
	borderTop: "1px solid",
	borderColor: colors.hfborder,
	placeItems: "end",
	alignItems: "center",
	padding: "1rem",
	paddingBottom: "calc(env(safe-area-inset-bottom) / 2 + 1rem)",
	boxShadow: `0 -3px 3px ${colors.hfshadow}`,
	zIndex: 1,
});

export const contents = style({
	overflow: "auto",
	overscrollBehavior: "none",
});

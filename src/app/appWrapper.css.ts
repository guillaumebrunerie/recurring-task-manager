import { style } from "@vanilla-extract/css";

import { colors } from "./themes.css";

export const container = style({
	height: "100%",
	display: "grid",
	gridTemplateRows: "4rem 1fr auto",
});

export const header = style({
	backgroundColor: colors.hfbackground,
	borderBottom: "1px solid",
	borderColor: colors.hfborder,
	display: "grid",
	paddingInline: "1rem",
	gridTemplateColumns: "2rem 1fr 2rem",
	placeItems: "center",
	boxShadow: `0 3px 3px ${colors.hfshadow}`,
	zIndex: 1,
	"& svg": { width: "110%", height: "auto", strokeWidth: 1.3, fill: "white" },
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
	zIndex: 2,
});

export const contents = style({
	overflow: "auto",
	overscrollBehavior: "none",
	paddingBottom: "3rem",
});

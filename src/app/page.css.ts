import { style } from "@vanilla-extract/css";

import { colors } from "./themes.css";

export const container = style({
	height: "100dvh",
	display: "grid",
	gridTemplateRows: "4rem 1fr 4rem",
});

export const header = style({
	backgroundColor: colors.hfbackground,
	borderBottom: "1px solid",
	borderColor: colors.hfborder,
	display: "grid",
	paddingInline: "1rem",
	gridTemplateColumns: "2rem 1fr 2rem",
	gridTemplateAreas: `"notifications title menu"`,
	placeItems: "center",
	boxShadow: `0 3px 3px ${colors.hfshadow}`,
	zIndex: 1,
	"& svg": { width: "110%", height: "auto", strokeWidth: 1.3, fill: "white" },
});

export const title = style({
	gridArea: "title",
	fontSize: "1.5rem",
	fontWeight: 600,
	color: colors.hfforeground,
});

export const contents = style({
	overflow: "auto",
	overscrollBehavior: "none",
	paddingBottom: "3rem",
});

export const taskPage = style({
	display: "flex",
	flexDirection: "column",
	gap: "0.8rem",
	padding: "1rem",
	paddingBottom: "3rem",
});

export const loadingContainer = style({
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	height: "100%",
});

export const footer = style({
	display: "flex",
	flexDirection: "row",
	justifyContent: "space-between",
	alignItems: "center",
	backgroundColor: colors.hfbackground,
	borderTop: "1px solid",
	borderColor: colors.hfborder,
	padding: "1rem",
	paddingBottom: "calc(env(safe-area-inset-bottom) / 2 + 1rem)",
	boxShadow: `0 -3px 3px ${colors.hfshadow}`,
	zIndex: 2,
});

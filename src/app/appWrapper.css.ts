import { keyframes, style } from "@vanilla-extract/css";

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

const expandInput = keyframes({
	from: { width: 0, opacity: 0 },
	to: { width: "9rem", opacity: 1 },
});

const collapseInput = keyframes({
	"0%": { width: "9rem", opacity: 1 },
	"60%": { opacity: 1 },
	"100%": { width: 0, opacity: 0 },
});

export const searchButton = style({
	background: "none",
	border: "none",
	cursor: "pointer",
	padding: "0.3rem",
	color: "light-dark(#666, #999)",
	display: "flex",
	alignItems: "center",
	"& svg": { width: "1.4rem", height: "1.4rem" },
});

const searchInputBase = {
	fontSize: "0.9rem",
	padding: "0.35rem 0.6rem",
	border: "1px solid",
	borderColor: colors.hfborder,
	borderRadius: "8px",
	backgroundColor: colors.background,
	color: colors.foreground,
	outline: "none",
	overflow: "hidden" as const,
	animationDuration: "0.2s",
	animationTimingFunction: "ease",
	animationFillMode: "both",
	":focus": {
		borderColor: colors.foreground,
	},
} as const;

export const searchInput = style({
	...searchInputBase,
	animationName: expandInput,
});

export const searchInputClosing = style({
	...searchInputBase,
	animationName: collapseInput,
});

export const searchInputActive = style({
	borderColor: colors.editButton,
	borderWidth: "2px",
	":focus": {
		borderColor: colors.editButton,
	},
});

export const contents = style({
	overflow: "auto",
	overscrollBehavior: "none",
	paddingBottom: "3rem",
});

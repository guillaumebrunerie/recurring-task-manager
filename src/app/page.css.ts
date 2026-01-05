import { createVar, style } from "@vanilla-extract/css";
import { colors } from "./themes.css";

export const taskPage = style({
	display: "flex",
	flexDirection: "column",
	gap: "0.8rem",
	padding: "1rem",
	paddingBottom: "3rem",
});

export const section = style({ display: "flex", flexDirection: "column" });

export const sectionTitle = style({
	fontSize: "1.2rem",
	fontWeight: 600,
	color: colors.sectionTitle,
	marginBottom: "0.7rem",
	cursor: "pointer",
});

export const arrow = style({
	display: "inline-block",
	transition: "rotate 0.3s ease",
});

export const arrowCollapsed = style({ rotate: "-90deg" });

export const collapseDelayVar = createVar();

export const taskList = style({
	display: "flex",
	flexDirection: "column",
	gap: "0.75rem",
	interpolateSize: "allow-keywords",
	transition: `all ${collapseDelayVar} ease`,
	overflow: "hidden",
});

export const taskListCollapsed = style({ height: "0" });

export const taskListFullyOpen = style({ overflow: "visible" });

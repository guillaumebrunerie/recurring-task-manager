import { createVar, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

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

import { createGlobalTheme } from "@vanilla-extract/css";

import { tw } from "./tw.css";

export const colors = createGlobalTheme(":root", {
	// Theme color?
	hfbackground: `light-dark(#f9fafb, oklch(0.23 0 0))`,
	hfbackgroundhover: `light-dark(#f3f4f6, oklch(0.30 0 0))`,
	hfborder: `light-dark(#e5e7eb, oklch(0.35 0 0))`,
	hfforeground: `light-dark(${tw.slate800}, oklch(0.95 0 0))`,
	hfshadow: `light-dark(#0000001a, #00000080)`,
	background: `light-dark(${tw.slate50}, oklch(0.2 0 0))`,
	foreground: `light-dark(${tw.slate800}, oklch(0.87 0 0))`,
	sectionTitle: `light-dark(${tw.slate800}, oklch(0.87 0 0))`,
	cardStatus: {
		red: {
			backgroundColor: `light-dark(${tw.red50}, oklch(0.25 0.02 25))`,
			borderColor: `light-dark(${tw.red700}, oklch(0.5 0.1 25))`,
			color: `light-dark(${tw.red800}, oklch(0.7 0.15 25))`,
		},
		yellow: {
			backgroundColor: `light-dark(${tw.yellow50}, oklch(0.25 0.02 90))`,
			borderColor: `light-dark(${tw.yellow700}, oklch(0.5 0.1 90))`,
			color: `light-dark(${tw.yellow800}, oklch(0.7 0.15 90))`,
		},
		blue: {
			backgroundColor: `light-dark(${tw.sky50}, oklch(0.25 0.02 260))`,
			borderColor: `light-dark(${tw.sky700}, oklch(0.5 0.1 260))`,
			color: `light-dark(${tw.sky800}, oklch(0.7 0.15 260))`,
		},
		green: {
			backgroundColor: `light-dark(${tw.emerald50}, oklch(0.25 0.02 150))`,
			borderColor: `light-dark(${tw.emerald700}, oklch(0.5 0.1 150))`,
			color: `light-dark(${tw.emerald800}, oklch(0.7 0.15 150))`,
		},
		grey: {
			backgroundColor: `light-dark(${tw.zinc50}, oklch(0.25 0 0))`,
			borderColor: `light-dark(${tw.zinc400}, oklch(0.4 0 0))`,
			color: `light-dark(${tw.zinc500}, oklch(0.5 0 0))`,
		},
	},
	contextMenu: {
		background: `light-dark(white, white)`,
		border: `light-dark(#ddd, #ddd)`,
		hover: `light-dark(#f1f1f1, #f1f1f1)`,
		warning: `light-dark(#cc0000, #cc0000)`,
	},
	accomplishment: { background: `light-dark(#f6f6f6, oklch(0.3 0 0))` },
	doneButton: `light-dark(#4CAF50, oklch(0.4 0.1 144))`,
	editButton: `light-dark(#0077cc, oklch(0.4 0.1 250))`,
	buttonText: `light-dark(#ffffff, oklch(0.97 0 0))`,
	avatarBorder: `light-dark(#ffffff, oklch(0.4 0 0))`,
	// Modal
	modal: {
		background: `light-dark(#ffffff, #ffffff)`,
		color: `light-dark(#1c1c1e, #1c1c1e)`,
		closeButton: `light-dark(#888, #888)`,
		closeButtonHover: `light-dark(#000, #000)`,
	},
	detailsSection: `light-dark(#555, oklch(0.7 0 0))`,
	deleteButton: `light-dark(#cc0000, oklch(0.6 0.3 30))`,
});

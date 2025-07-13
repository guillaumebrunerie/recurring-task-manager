import { keyframes, style } from "@vanilla-extract/css";

const spin = keyframes({
	to: { transform: "rotate(360deg)" },
});

export const spinner = style({
	width: "1em",
	height: "1em",
	border: "2px solid currentColor",
	borderTopColor: "transparent",
	borderRadius: "50%",
	animation: `${spin} 1.2s linear infinite`,
	display: "inline-block",
	verticalAlign: "middle",
	marginRight: "0.5rem",
});

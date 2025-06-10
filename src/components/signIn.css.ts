import { style } from "@vanilla-extract/css";

export const signInWrapper = style({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	padding: "2rem",
	gap: "1.5rem",
	maxWidth: "400px",
	margin: "0 auto",
});

export const googleButton = style({
	backgroundColor: "white",
	border: "1px solid #ddd",
	padding: "0.75rem 1rem",
	fontSize: "1rem",
	borderRadius: "0.5rem",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	cursor: "pointer",
	transition: "box-shadow 0.2s",
	// color: "#4285f4",
	selectors: {
		"&:hover": {
			boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
		},
	},
});

export const googleLogo = style({
	height: "20px",
	width: "20px",
	marginRight: "0.5rem",
});

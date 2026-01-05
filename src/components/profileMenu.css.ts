import { colors } from "@/app/themes.css";
import { style } from "@vanilla-extract/css";

export const container = style({ position: "relative", zIndex: 1000 });

export const avatarButton = style({
	width: "40px",
	height: "40px",
	borderRadius: "50%",
	overflow: "hidden",
	cursor: "pointer",
	border: "2px solid",
	borderColor: colors.avatarBorder,
	boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
});

export const avatarImage = style({
	width: "100%",
	height: "100%",
	objectFit: "cover",
});

export const dropdown = style({
	position: "absolute",
	top: "40px",
	right: 0,
	backgroundColor: "white",
	border: "1px solid #ddd",
	borderRadius: "0.5rem",
	boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
	padding: "0.5rem 0",
	minWidth: "150px",
});

export const dropdownItem = style({
	padding: "0.5rem 1rem",
	fontSize: "0.95rem",
	cursor: "pointer",
	selectors: { "&:hover": { backgroundColor: "#f1f1f1" } },
});

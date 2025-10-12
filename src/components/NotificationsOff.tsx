import type { SVGProps } from "react";

export const NotificationsOff = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.6"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<path
			d="M21 3L3 21
           M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.93 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5
           m6 0a3 3 0 1 1-6 0"
		/>
	</svg>
);

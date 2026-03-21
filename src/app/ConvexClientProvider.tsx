"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

import { publicEnv } from "../shared/publicEnv";

const convex = new ConvexReactClient(publicEnv.NEXT_PUBLIC_CONVEX_URL);

export const ConvexClientProvider = ({ children }: { children: ReactNode }) => {
	return (
		<ConvexAuthNextjsProvider client={convex}>
			{children}
		</ConvexAuthNextjsProvider>
	);
};

// oxlint-disable node/no-process-env

import { type } from "arktype";

const publicEnvType = type({
	NEXT_PUBLIC_CONVEX_URL: "string",
	NEXT_PUBLIC_VAPID_PUBLIC_KEY: "string",
});

export const publicEnv = publicEnvType.assert({
	NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
	NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
});

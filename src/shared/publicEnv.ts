import { type } from "arktype";

const publicEnvType = type({
	NEXT_PUBLIC_CONVEX_URL: "string",
	NEXT_PUBLIC_VAPID_PUBLIC_KEY: "string",
});

// oxlint-disable-next-line no-process-env
export const publicEnv = publicEnvType.assert(process.env);

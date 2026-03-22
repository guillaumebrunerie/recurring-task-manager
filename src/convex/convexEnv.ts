"use node";

import { type } from "arktype";

const convexEnvType = type({
	CONVEX_URL: "string",
	CRON_NOTIFICATIONS_ENABLED: "string",
	VAPID_CONTACT_EMAIL: "string",
	VAPID_PRIVATE_KEY: "string",
	VAPID_PUBLIC_KEY: "string",
});

// oxlint-disable-next-line node/no-process-env
export const convexEnv = convexEnvType.assert(process.env);

import { type } from "arktype";

const privateEnvType = type({
	VAPID_CONTACT_EMAIL: "string",
	VAPID_PRIVATE_KEY: "string",
	CRON_NOTIFICATIONS_ENABLED: "string",
});

// oxlint-disable-next-line node/no-process-env
export const privateEnv = privateEnvType.assert(process.env);

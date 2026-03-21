import { type } from "arktype";

const authEnvType = type({ CONVEX_SITE_URL: "string" });

// oxlint-disable-next-line node/no-process-env
export const authEnv = authEnvType.assert(process.env);

import { type } from "arktype";

const authEnvType = type({ NEXT_PUBLIC_CONVEX_SITE_URL: "string" });

// oxlint-disable-next-line node/no-process-env
export const authEnv = authEnvType.assert(process.env);

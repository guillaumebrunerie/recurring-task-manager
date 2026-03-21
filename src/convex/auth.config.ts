import { authEnv } from "./authEnv";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
	providers: [{ domain: authEnv.CONVEX_SITE_URL, applicationID: "convex" }],
};

import { privateEnv } from "./env";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
	providers: [
		{ domain: privateEnv.CONVEX_SITE_URL, applicationID: "convex" },
	],
};

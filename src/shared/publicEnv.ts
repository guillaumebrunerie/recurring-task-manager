// oxlint-disable node/no-process-env

import { type } from "arktype";

const string = type("string");

// Note that process.env cannot be used as is, it needs to be used as
// process.env.KEY. This is why we export each variable separately, instead of
// exporting the whole process.env at once.

export const NEXT_PUBLIC_CONVEX_CLOUD_URL = string.assert(
	process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL,
);

export const NEXT_PUBLIC_VAPID_PUBLIC_KEY = string.assert(
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
);

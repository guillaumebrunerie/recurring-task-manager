import "server-only";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { cache } from "react";

export const getToken = cache(convexAuthNextjsToken);

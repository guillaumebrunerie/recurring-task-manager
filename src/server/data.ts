import "server-only";

import { preloadQuery } from "convex/nextjs";
import { cache } from "react";

import { api } from "@/convex/_generated/api";

import { getToken } from "./auth";

export const getTasks = cache(async () => {
	const token = await getToken();
	return preloadQuery(api.tasks.getAll, {}, { token });
});

export const getAllUsers = cache(async () => {
	const token = await getToken();
	return preloadQuery(api.users.getAllUsersQuery, {}, { token });
});

export const getCurrentUser = cache(async () => {
	const token = await getToken();
	return preloadQuery(api.users.getCurrentUserQuery, {}, { token });
});

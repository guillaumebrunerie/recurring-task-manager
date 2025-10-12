import type { Id } from "@/convex/_generated/dataModel";

export type User = {
	id: Id<"users">;
	name?: string;
	image?: string;
};

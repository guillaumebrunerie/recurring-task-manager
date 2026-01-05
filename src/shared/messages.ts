import type { Id } from "@/convex/_generated/dataModel";

export type MessageData = {
	type: "task-completed";
	taskId: Id<"tasks">;
};

export const taskCompleted = (taskId: Id<"tasks">): MessageData => ({
	type: "task-completed",
	taskId,
});

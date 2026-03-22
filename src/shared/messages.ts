import type { Id } from "@/convex/_generated/dataModel";

// Data sent to the service worker from the server via push messages

export type PushMessageData = {
	taskId: Id<"tasks">;
	taskName: string;
	isLate: boolean;
	convexUrl: string;
	subscription: string;
};

// Data sent to the service worker from the client via postMessage

export type MessageData = { type: "task-completed"; taskId: Id<"tasks"> };

export const taskCompleted = (taskId: Id<"tasks">): MessageData => ({
	type: "task-completed",
	taskId,
});

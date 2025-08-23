import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

if (process.env.NODE_ENV === "production") {
	crons.hourly(
		"notification for tasks",
		{ minuteUTC: 30 },
		internal.notifications.notifyAllUsers,
	);
}

export default crons;

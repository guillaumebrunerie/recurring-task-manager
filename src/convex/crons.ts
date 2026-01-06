import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
	"notification for tasks",
	{ minuteUTC: 30 },
	internal.notifications.notifyAllUsers,
);

export default crons;

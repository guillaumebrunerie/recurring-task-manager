import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
	"daily notification for tasks",
	{ hourUTC: 7, minuteUTC: 0 },
	internal.notifications.notifyAllUsers,
);

export default crons;

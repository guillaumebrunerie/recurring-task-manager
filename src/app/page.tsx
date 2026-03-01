import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";

import { Home } from "./HomeContents";

const Page = async () => {
	const token = await convexAuthNextjsToken();
	const [preloadedTasks, preloadedAllUsers, preloadedCurrentUser] =
		await Promise.all([
			preloadQuery(api.tasks.getAll, {}, { token }),
			preloadQuery(api.users.getAllUsersQuery, {}, { token }),
			preloadQuery(api.users.getCurrentUserQuery, {}, { token }),
		]);
	return (
		<Home
			preloadedTasks={preloadedTasks}
			preloadedAllUsers={preloadedAllUsers}
			preloadedCurrentUser={preloadedCurrentUser}
		/>
	);
};

export default Page;

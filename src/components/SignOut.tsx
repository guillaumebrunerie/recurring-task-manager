import { useAuthActions } from "@convex-dev/auth/react";
import ProfileMenu from "./ProfileMenu";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const defaultUserImage = "";

export function SignOut() {
	const { signOut } = useAuthActions();
	const user = useQuery(api.users.getCurrentUser);
	return (
		<ProfileMenu
			imageUrl={user?.image || defaultUserImage}
			onSignOut={() => void signOut()}
		/>
	);
}

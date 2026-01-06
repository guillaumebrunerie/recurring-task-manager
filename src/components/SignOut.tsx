"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import { ProfileMenu } from "./ProfileMenu";
import type { NotificationsProps } from "./usePushNotificationManager";

const defaultUserImage = "";

type SignOutProps = { notifications: NotificationsProps };
export const SignOut = ({ notifications }: SignOutProps) => {
	const { signOut } = useAuthActions();
	const user = useQuery(api.users.getCurrentUserQuery);
	return (
		<ProfileMenu
			imageUrl={user?.image || defaultUserImage}
			onSignOut={() => void signOut()}
			notifications={notifications}
		/>
	);
};

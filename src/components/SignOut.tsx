"use client";

import { useAuthActions } from "@convex-dev/auth/react";

import type { User } from "@/shared/users";

import { ProfileMenu } from "./ProfileMenu";
import type { NotificationsProps } from "./usePushNotificationManager";

const defaultUserImage = "";

type SignOutProps = { notifications: NotificationsProps; currentUser?: User | null };
export const SignOut = ({ notifications, currentUser }: SignOutProps) => {
	const { signOut } = useAuthActions();
	return (
		<ProfileMenu
			imageUrl={currentUser?.image || defaultUserImage}
			onSignOut={() => void signOut()}
			notifications={notifications}
		/>
	);
};

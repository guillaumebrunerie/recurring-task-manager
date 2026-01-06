import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import * as styles from "./profileMenu.css";
import { Spinner } from "./Spinner";
import type { NotificationsProps } from "./usePushNotificationManager";

type ProfileMenuProps = {
	imageUrl?: string;
	onSignOut: () => void;
	notifications: NotificationsProps;
};

export const ProfileMenu = ({
	imageUrl,
	onSignOut,
	notifications,
}: ProfileMenuProps) => {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const notificationMessages = {
		unsupported: "Notifications non supportées",
		pending: <Spinner />,
		unsubscribed: "Notifications désactivées",
		subscribed: "Notifications activées",
	} as const;

	return (
		<div className={styles.container} ref={containerRef}>
			<button
				className={styles.avatarButton}
				onClick={() => setOpen(!open)}
			>
				<Image
					width={36}
					height={36}
					src={imageUrl || "/missing-profile-picture.png"}
					alt="Profile"
					className={styles.avatarImage}
				/>
			</button>
			{open && (
				<div className={styles.dropdown}>
					<div
						onClick={() => {
							notifications.toggleSubscription();
						}}
						className={styles.dropdownItem}
					>
						{notificationMessages[notifications.state]}
					</div>
					<div className={styles.dropdownItem} onClick={onSignOut}>
						Se déconnecter
					</div>
				</div>
			)}
		</div>
	);
};

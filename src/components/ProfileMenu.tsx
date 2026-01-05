import { useState, useRef, useEffect } from "react";
import * as styles from "./profileMenu.css";
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
		pending: "Notifications ...",
		unsubscribed: "Notifications OFF",
		subscribed: "Notifications ON",
	} as const;

	return (
		<div className={styles.container} ref={containerRef}>
			<button
				className={styles.avatarButton}
				onClick={() => setOpen(!open)}
			>
				{imageUrl && (
					<img
						src={imageUrl}
						alt="Profile"
						className={styles.avatarImage}
					/>
				)}
			</button>
			{open && (
				<div className={styles.dropdown}>
					<div
						onClick={() => {
							void notifications.toggleSubscription;
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

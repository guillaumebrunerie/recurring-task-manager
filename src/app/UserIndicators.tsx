import classNames from "classnames";
import Image from "next/image";

import type { User } from "@/shared/users";

import * as styles from "./taskCard.css";

// Single user indicator

type UserIndicatorProps = { user: User; isDisabled?: boolean };

const UserIndicator = ({ user, isDisabled }: UserIndicatorProps) => {
	return (
		<Image
			width={24}
			height={24}
			src={user.image || "/missing-profile-picture.png"}
			alt="Profile"
			className={classNames(
				styles.assignee,
				isDisabled && styles.disabledAssignee,
			)}
		/>
	);
};

// Multiple user indicators

type UserIndicatorsProps = { enabledUsers: User[]; allUsers: User[] };

export const UserIndicators = ({
	enabledUsers,
	allUsers,
}: UserIndicatorsProps) => {
	return (
		<div className={styles.userIndicators}>
			{allUsers.toReversed().map((user) => {
				if (enabledUsers.some((u) => u.id == user.id)) {
					return;
				} else {
					return (
						<UserIndicator key={user.id} user={user} isDisabled />
					);
				}
			})}
			{enabledUsers.toReversed().map((user) => (
				<UserIndicator key={user.id} user={user} />
			))}
		</div>
	);
};

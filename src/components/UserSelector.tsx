import * as styles from "./userSelector.css";
import type { Id } from "@/convex/_generated/dataModel";
import type { User } from "@/shared/users";
import Image from "next/image";

type UserSelectorButtonProps = {
	user: User;
	isSelected: boolean;
	isPrimary?: boolean;
	onToggle: () => void;
};

const UserSelectorButton = ({
	user,
	isSelected,
	isPrimary,
	onToggle,
}: UserSelectorButtonProps) => {
	const displayName = user.name ? user.name.split(" ")[0] : "Unknown";
	return (
		<button
			className={`${styles.user} ${isSelected ? styles.selected : ""} ${isPrimary ? styles.primary : ""}`}
			onClick={onToggle}
			type="button"
		>
			<Image
				width={24}
				height={24}
				src={user.image || "/missing-profile-picture.png"}
				alt={displayName}
				className={styles.avatar}
			/>
			<span>{displayName}</span>
		</button>
	);
};

type UserSelectorProps = {
	users: User[];
	selected: Set<Id<"users">>;
	hasPrimary?: boolean;
	onChange: (selected: Set<Id<"users">>) => void;
};

export const UserSelector = ({
	users,
	selected,
	hasPrimary,
	onChange,
}: UserSelectorProps) => {
	const toggle = (id: Id<"users">) => {
		if (selected.has(id)) {
			onChange(new Set([...selected].filter((userId) => userId !== id)));
		} else {
			onChange(new Set([...selected, id]));
		}
	};

	return (
		<div className={styles.grid}>
			{users.map((user) => (
				<UserSelectorButton
					key={user.id}
					user={user}
					isSelected={selected.has(user.id)}
					isPrimary={hasPrimary && user.id === [...selected][0]}
					onToggle={() => toggle(user.id)}
				/>
			))}
		</div>
	);
};

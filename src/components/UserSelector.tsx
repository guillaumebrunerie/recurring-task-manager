import React from "react";
import * as styles from "./userSelector.css";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "@/shared/users";

type UserSelectorButtonProps = {
	user: User;
	isSelected: boolean;
	onToggle: () => void;
};

const UserSelectorButton = ({
	user,
	isSelected,
	onToggle,
}: UserSelectorButtonProps) => {
	const displayName = user.name ? user.name.split(" ")[0] : "Unknown";
	return (
		<button
			className={`${styles.user} ${isSelected ? styles.selected : ""}`}
			onClick={onToggle}
			type="button"
		>
			<img
				src={user.image || undefined}
				alt={user.name}
				className={styles.avatar}
			/>
			<span>{displayName}</span>
		</button>
	);
};

type UserSelectorProps = {
	users: User[];
	selected: Set<Id<"users">>;
	onChange: (selected: Set<Id<"users">>) => void;
};

export const UserSelector = ({
	users,
	selected,
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
					onToggle={() => toggle(user.id)}
				/>
			))}
		</div>
	);
};

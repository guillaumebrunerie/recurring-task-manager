import React from "react";
import * as styles from "./userSelector.css";
import { Id } from "../../convex/_generated/dataModel";
import { User } from "../../convex/users";

interface UserSelectorProps {
	users: User[];
	selected: Set<Id<"users">>;
	onChange: (selected: Set<Id<"users">>) => void;
}

export default function UserSelector({
	users,
	selected,
	onChange,
}: UserSelectorProps) {
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
				<button
					key={user.id}
					className={`${styles.user} ${selected.has(user.id) ? styles.selected : ""}`}
					onClick={() => toggle(user.id)}
					type="button"
				>
					<img
						src={user.image || undefined}
						alt={user.name}
						className={styles.avatar}
					/>
					<span>{user.name.split(" ")[0]}</span>
				</button>
			))}
		</div>
	);
}

"use client";

import type { User } from "@/shared/users";

import { Modal } from "@/components/Modal";
import { useModal } from "@/hooks/useModal";

import { Edit } from "./Edit";

type NewTaskProps = { user: User; allUsers: User[] };

export const NewTask = ({ user, allUsers }: NewTaskProps) => {
	const { isNewTaskOpen, closeModal } = useModal();

	return (
		isNewTaskOpen && (
			<Modal title="Nouvelle tâche" onClose={closeModal}>
				<Edit
					task={undefined}
					user={user}
					allUsers={allUsers}
					closeModal={closeModal}
				/>
			</Modal>
		)
	);
};

"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as styles from "./taskCard.css";
import { relativeDurationToString } from "@/shared/units";
import { useEffect, useRef, useState } from "react";
import {
	type Task,
	taskStatus,
	taskTimeDifferenceInUnit,
} from "@/shared/tasks";
import confetti from "canvas-confetti";
import { fromLocalDateTimeString } from "@/shared/localDateTime";

import { parseAsBoolean, useQueryState } from "nuqs";
import { Modal } from "@/components/Modal";
import { Details } from "./Details";
import { Edit } from "./Edit";
import { Spinner } from "@/components/Spinner";
import type { Id } from "@/convex/_generated/dataModel";

const celebrateCompletionWithConfetti = () => {
	confetti({
		particleCount: 100,
		spread: 70,
		origin: { y: 1 },
	});
};

export const TaskCard = ({ task, now }: { task: Task; now: number }) => {
	const status = taskStatus(task, now);
	const actualTimeInUnit = taskTimeDifferenceInUnit(task, now);
	const addAccomplishment = useMutation(
		api.accomplishments.addAccomplishment,
	);

	const timeString =
		actualTimeInUnit === null ? "" : (
			`(prévu ${relativeDurationToString(actualTimeInUnit, task.toleranceUnit)})`
		);

	const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
	const [taskIdUrl, setTaskIdUrl] = useQueryState("task");
	const [isEditing, setIsEditing] = useQueryState(
		"edit",
		parseAsBoolean.withDefault(false),
	);
	const isDetailsOpen = taskIdUrl === task.id && !isEditing;
	const isEditOpen = taskIdUrl === task.id && isEditing;

	const handleSubmit = async (doneTime?: string) => {
		try {
			await addAccomplishment({
				taskId: task.id,
				completionTime:
					doneTime ? fromLocalDateTimeString(doneTime) : undefined,
				updateToBeDoneTime: true,
			});
			celebrateCompletionWithConfetti();
			navigator.serviceWorker?.controller?.postMessage({
				type: "task-completed",
				taskId: task.id,
			});
		} finally {
			closeModal();
			setIsContextMenuOpen(false);
		}
	};

	const toggleContextMenu = (event: React.MouseEvent) => {
		event.stopPropagation();
		if (isContextMenuOpen) {
			setIsContextMenuOpen(false);
		} else {
			setIsContextMenuOpen(true);
		}
	};

	const isPrivate = task.visibleTo.length == 1;

	const allUsers = useQuery(api.users.getAll);
	const currentUser = useQuery(api.users.getCurrentUser);

	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsContextMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const openDetails = () => {
		setIsContextMenuOpen(false);
		setTaskIdUrl(task.id, { history: "push" });
		setIsEditing(false, { history: "push" });
	};
	const openEdit = () => {
		setIsContextMenuOpen(false);
		setTaskIdUrl(task.id, { history: "push" });
		setIsEditing(true, { history: "push" });
	};
	const closeModal = () => {
		setTaskIdUrl(null, { history: "push" });
		setIsEditing(false, { history: "push" });
	};

	return (
		<>
			<div
				className={
					styles.statusVariants({ status }) + " " + styles.card
				}
				onClick={openDetails}
				role="button"
				tabIndex={0}
				ref={containerRef}
			>
				<div className={styles.topRow}>
					<div className={styles.name}>
						{isPrivate && <span className={styles.lock}>🔒 </span>}
						{task.name}
					</div>
					<div
						className={styles.threeDots}
						onClick={toggleContextMenu}
					>
						<div className={styles.dot} />
						<div className={styles.dot} />
						<div className={styles.dot} />
					</div>
				</div>
				<div className={styles.bottomRow}>
					<div className={styles.userIndicators}>
						{task.responsibleFor.toReversed().map((userId) => {
							if (task.toBeCompletedBy.includes(userId)) {
								return null;
							} else {
								return (
									<UserIndicator
										key={userId}
										userId={userId}
										isDisabled
									/>
								);
							}
						})}
						{task.toBeCompletedBy.map((userId) => (
							<UserIndicator key={userId} userId={userId} />
						))}
					</div>
					<div className={styles.time}>{timeString}</div>
				</div>
				{isContextMenuOpen && (
					<div
						className={styles.contextMenu}
						onClick={(e) => e.stopPropagation()}
					>
						{!task.isArchived && (
							<CompleteMenuItem onComplete={handleSubmit} />
						)}
						<DetailsMenuItem onClick={openDetails} />
						{!task.isArchived && (
							<EditMenuItem onClick={openEdit} />
						)}
						{!task.isArchived && <ArchiveMenuItem task={task} />}
						{task.isArchived && <UnarchiveMenuItem task={task} />}
						{task.isArchived && <hr className={styles.separator} />}
						{task.isArchived && <DeleteMenuItem task={task} />}
					</div>
				)}
			</div>
			{isDetailsOpen && (
				<Modal title={task.name} onClose={closeModal}>
					<Details
						task={task}
						handleSubmit={handleSubmit}
						onEdit={openEdit}
					/>
				</Modal>
			)}
			{isEditOpen && (
				<Modal title="Éditer la tâche" onClose={closeModal}>
					<Edit
						task={task}
						user={currentUser || undefined}
						allUsers={allUsers}
						closeModal={closeModal}
					/>
				</Modal>
			)}
		</>
	);
};

type UserIndicatorProps = {
	userId?: Id<"users">;
	isDisabled?: boolean;
};

const UserIndicator = ({ userId, isDisabled }: UserIndicatorProps) => {
	const user = useQuery(api.users.getUser, {
		userId,
	});
	const imageUrl = user?.image;
	if (!imageUrl) {
		return;
	}

	return (
		<img
			src={imageUrl}
			alt="Profile"
			className={
				styles.assignee +
				" " +
				(isDisabled ? styles.disabledAssignee : "")
			}
		/>
	);
};

const CompleteMenuItem = ({
	onComplete,
}: {
	onComplete: () => Promise<void>;
}) => {
	const [isCompleting, setIsCompleting] = useState(false);
	return (
		<div
			className={styles.contextMenuItem}
			onClick={async (event) => {
				event.stopPropagation();
				if (!isCompleting) {
					setIsCompleting(true);
					try {
						await onComplete();
					} finally {
						setIsCompleting(false);
					}
				}
			}}
		>
			{isCompleting && <Spinner />}
			Effectué! ✅
		</div>
	);
};

const DetailsMenuItem = ({ onClick }: { onClick: () => void }) => {
	return (
		<div className={styles.contextMenuItem} onClick={onClick}>
			Détails
		</div>
	);
};

const EditMenuItem = ({ onClick }: { onClick: () => void }) => {
	return (
		<div className={styles.contextMenuItem} onClick={onClick}>
			Éditer
		</div>
	);
};

const ArchiveMenuItem = ({ task }: { task: Task }) => {
	const [isCompleting, setIsCompleting] = useState(false);
	const archiveTask = useMutation(api.tasks.archiveTask);

	return (
		<div
			className={styles.contextMenuItem}
			onClick={async (event) => {
				event.stopPropagation();
				setIsCompleting(true);
				try {
					await archiveTask({ id: task.id });
				} finally {
					setIsCompleting(false);
				}
			}}
		>
			{isCompleting && <Spinner />}
			Supprimer
		</div>
	);
};

const UnarchiveMenuItem = ({ task }: { task: Task }) => {
	const [isCompleting, setIsCompleting] = useState(false);
	const unarchiveTask = useMutation(api.tasks.unarchiveTask);

	return (
		<div
			className={styles.contextMenuItem}
			onClick={async (event) => {
				event.stopPropagation();
				setIsCompleting(true);
				try {
					await unarchiveTask({ id: task.id });
				} finally {
					setIsCompleting(false);
				}
			}}
		>
			{isCompleting && <Spinner />}
			Restorer
		</div>
	);
};

const DeleteMenuItem = ({ task }: { task: Task }) => {
	const [isCompleting, setIsCompleting] = useState(false);
	const deleteTask = useMutation(api.tasks.deleteTask);

	return (
		<div
			className={styles.contextMenuItem + " " + styles.warningText}
			onClick={async (event) => {
				event.stopPropagation();
				setIsCompleting(true);
				try {
					await deleteTask({ id: task.id });
				} finally {
					setIsCompleting(false);
				}
			}}
		>
			{isCompleting && <Spinner />}
			Supprimer définitivement
		</div>
	);
};

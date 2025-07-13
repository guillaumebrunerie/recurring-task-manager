"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as styles from "./taskCard.css";
import { relativeDurationToString } from "@/shared/units";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Task, taskStatus, taskTimeDifferenceInUnit } from "@/shared/tasks";
import confetti from "canvas-confetti";
import { fromLocalDateTimeString } from "@/shared/localDateTime";

import { useQueryState } from "nuqs";
import { Modal } from "@/components/Modal";
import { Details } from "./Details";
import { Spinner } from "@/components/Spinner";

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
			`(prévu ${relativeDurationToString(actualTimeInUnit, task.unit)})`
		);

	const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
	const [detailsOpenFor, setDetailsOpenFor] = useQueryState("task");
	const isDetailsOpen = detailsOpenFor === task.id;

	const handleSubmit = async (doneTime?: string) => {
		try {
			await addAccomplishment({
				taskId: task.id,
				completionTime:
					doneTime ? fromLocalDateTimeString(doneTime) : undefined,
				updateToBeDoneTime: true,
			});
			celebrateCompletionWithConfetti();
		} finally {
			closeDetails();
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
	const user = useQuery(api.users.getUser, {
		userId: task.toBeCompletedBy || undefined,
	});
	const imageUrl = user?.image;

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
		setDetailsOpenFor(task.id, { history: "push" });
	};
	const closeDetails = () => {
		setDetailsOpenFor(null, { history: "push" });
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
					{imageUrl ?
						<img
							src={imageUrl}
							alt="Profile"
							className={styles.assignee}
						/>
					:	<div />}
					<div className={styles.time}>{timeString}</div>
				</div>
				{isContextMenuOpen && (
					<div className={styles.contextMenu}>
						{!task.isArchived && (
							<CompleteMenuItem onComplete={handleSubmit} />
						)}
						<DetailsMenuItem onClick={openDetails} />
						{!task.isArchived && <EditMenuItem task={task} />}
						{!task.isArchived && <ArchiveMenuItem task={task} />}
						{task.isArchived && <UnarchiveMenuItem task={task} />}
						{task.isArchived && <hr className={styles.separator} />}
						{task.isArchived && <DeleteMenuItem task={task} />}
					</div>
				)}
			</div>
			{isDetailsOpen && (
				<Modal title={task.name} onClose={closeDetails}>
					<Details task={task} handleSubmit={handleSubmit} />
				</Modal>
			)}
		</>
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
		<div
			className={styles.contextMenuItem}
			onClick={() => {
				onClick();
			}}
		>
			Détails
		</div>
	);
};

const EditMenuItem = ({ task }: { task: Task }) => {
	return (
		<Link href={`/task/${task.id}`} className={styles.contextMenuItem}>
			Éditer
		</Link>
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

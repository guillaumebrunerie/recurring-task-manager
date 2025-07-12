"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as styles from "./tasks.css";
import * as common from "./common.css";
import { useTimestamp } from "../hooks/useTimestamp";
import { relativeDurationToString, durationUnitToString } from "@/shared/units";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
	Task,
	compareTasks,
	taskStatus,
	taskTimeDifferenceInUnit,
} from "@/shared/tasks";
import { Accomplishment } from "@/shared/accomplishments";
import { AppWrapper } from "./AppWrapper";
import useDelayedTruth from "@/hooks/useDelayedTruth";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import confetti from "canvas-confetti";
import {
	fromLocalDateTimeString,
	toLocalDateTimeString,
} from "@/shared/localDateTime";

const Home = () => {
	const now = useTimestamp();
	const tasks = useQuery(api.tasks.getAll);

	if (!tasks) {
		return <div className={common.loading}>Chargement...</div>;
	}

	tasks.sort((taskA, taskB) => compareTasks(taskA, taskB, now));
	const overdueTasks = tasks.filter(
		(task) => taskStatus(task, now) === "overdue",
	);
	const dueTasks = tasks.filter((task) => taskStatus(task, now) === "due");
	const waitingTasks = tasks.filter(
		(task) => taskStatus(task, now) === "waiting",
	);
	const archivedTasks = tasks.filter(
		(task) => taskStatus(task, now) === "archived",
	);

	return (
		<AppWrapper
			title="Project Happy Home"
			footer={
				<Link href="/task/new" className={styles.addTaskButton}>
					Nouvelle tâche
				</Link>
			}
		>
			<div className={styles.taskPage}>
				<Section title="En retard" tasks={overdueTasks} now={now} />
				<Section title="À faire" tasks={dueTasks} now={now} />
				{overdueTasks.length == 0 && dueTasks.length == 0 && (
					<EmptySection />
				)}
				<Section
					title="En attente"
					tasks={waitingTasks}
					now={now}
					startCollapsed
				/>
				<Section
					title="Archivées"
					tasks={archivedTasks}
					now={now}
					startCollapsed
				/>
			</div>
		</AppWrapper>
	);
};

const Section = ({
	title,
	tasks,
	now,
	startCollapsed = false,
}: {
	title: string;
	tasks: Task[];
	now: number;
	startCollapsed?: boolean;
}) => {
	const [isCollapsed, setIsCollapsed] = useState(startCollapsed);
	const collapseDelay = 300;
	const fullyOpen = useDelayedTruth(!isCollapsed, collapseDelay);
	if (tasks.length == 0) {
		return null;
	}
	return (
		<div className={styles.section2}>
			<h2
				className={styles.sectionTitle2}
				onClick={() => setIsCollapsed(!isCollapsed)}
			>
				<span className={styles.arrow({ isCollapsed })}>▼</span>
				{isCollapsed ? ` ${title} (${tasks.length})` : ` ${title}`}
			</h2>
			<div
				className={styles.taskList({ isCollapsed, fullyOpen })}
				style={assignInlineVars({
					[styles.collapseDelayVar]: `${collapseDelay}ms`,
				})}
			>
				{tasks.length > 0 ?
					tasks.map((task) => (
						<TaskCard key={task.id} task={task} now={now} />
					))
				:	"Aucune tâche à afficher."}
			</div>
		</div>
	);
};

const EmptySection = () => {
	return (
		<div className={styles.taskList({ isCollapsed: false })}>
			Aucune tâche à effectuer!
		</div>
	);
};

const nbsp = "\u00A0";

const TaskCard = ({ task, now }: { task: Task; now: number }) => {
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
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [doneTime, setDoneTime] = useState(toLocalDateTimeString(Date.now()));

	const handleSubmit = async () => {
		const timestamp = fromLocalDateTimeString(doneTime);

		try {
			await addAccomplishment({
				taskId: task.id,
				completionTime: timestamp,
				updateToBeDoneTime: true,
			});
		} finally {
			setIsContextMenuOpen(false);
		}
	};

	const toggleContextMenu = (event: React.MouseEvent) => {
		event.stopPropagation();
		if (isContextMenuOpen) {
			setIsContextMenuOpen(false);
		} else {
			setIsContextMenuOpen(true);
			setDoneTime(toLocalDateTimeString(Date.now()));
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
		setIsDetailsOpen(true);
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
							<CompleteMenuItem
								onComplete={async () => {
									setDoneTime(
										toLocalDateTimeString(Date.now()),
									);
									await handleSubmit();
									confetti({
										particleCount: 100,
										spread: 70,
										origin: { y: 1 },
									});
								}}
							/>
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
				<div
					className={styles.overlay}
					onClick={() => setIsDetailsOpen(false)}
				>
					<div className={styles.modalOverlay}>
						<div
							className={styles.modalContent}
							onClick={(e) => e.stopPropagation()}
						>
							<button
								className={styles.closeButton}
								onClick={() => setIsDetailsOpen(false)}
								aria-label="Close"
							>
								✕
							</button>
							<div className={styles.modalHeader}>
								{task.name}
								{nbsp}
							</div>
							<div className={styles.description}>
								{task.description}
							</div>
							<div className={styles.interval}>
								Intervalle:{" "}
								{durationUnitToString(task.period, task.unit)}
								{task.tolerance > 0 &&
									" ± " +
										durationUnitToString(
											task.tolerance,
											task.unit,
										)}
							</div>
							<label className={styles.label}>
								Effectuée le :
								<input
									type="datetime-local"
									value={doneTime}
									onChange={(e) =>
										setDoneTime(e.target.value)
									}
									className={styles.input}
								/>
							</label>
							<div className={styles.modalButtons}>
								<button
									className={styles.primaryButton}
									onClick={handleSubmit}
								>
									Marquer comme effectuée
								</button>
								<Link
									href={`/task/${task.id}`}
									className={styles.addTaskButton}
								>
									Éditer
								</Link>
							</div>
							<TaskHistory task={task} />
						</div>
					</div>
				</div>
			)}
		</>
	);
};

const InlineSpinner = () => {
	return <span className={styles.spinner} />;
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
			{isCompleting && <InlineSpinner />}
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
			{isCompleting && <InlineSpinner />}
			Archiver
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
			{isCompleting && <InlineSpinner />}
			Désarchiver
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
			{isCompleting && <InlineSpinner />}
			Supprimer définitivement
		</div>
	);
};

const TaskHistory = ({ task }: { task: Task }) => {
	const history = task.accomplishments;
	return (
		<div className={styles.section}>
			<h3 className={styles.sectionTitle}>Historique</h3>
			{history.length > 0 ?
				<ul className={styles.completionList}>
					{history.map((accomplishment) => (
						<TaskHistoryItem
							key={accomplishment.id}
							accomplishment={accomplishment}
						/>
					))}
				</ul>
			:	"Pas d'historique pour cette tâche."}
		</div>
	);
};

const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", {
	dateStyle: "full",
	timeStyle: "short",
});

const TaskHistoryItem = ({
	accomplishment,
}: {
	accomplishment: Accomplishment;
}) => {
	const [isCompleting, setIsCompleting] = useState(false);
	const deleteAccomplishment = useMutation(
		api.accomplishments.deleteAccomplishment,
	);
	const [showDeleteButton, setShowDeleteButton] = useState(false);
	const doDelete = async () => {
		setIsCompleting(true);
		try {
			await deleteAccomplishment({ accomplishmentId: accomplishment.id });
		} finally {
			setIsCompleting(false);
		}
	};
	return (
		<li
			className={styles.completionItem}
			onClick={() => {
				setShowDeleteButton(!showDeleteButton);
			}}
		>
			<div className={styles.deleteHistoryItem}>
				<span
					className={styles.deleteHistoryItemButton({
						showDeleteButton,
					})}
					onClick={doDelete}
				>
					{isCompleting && <InlineSpinner />}
					Supprimer?
				</span>
				{dateTimeFormat.format(new Date(accomplishment.completionTime))}
			</div>
			{accomplishment.completedBy?.image && (
				<img
					src={accomplishment.completedBy.image}
					alt="Profile"
					className={styles.accomplishedBy}
				/>
			)}
		</li>
	);
};

export default Home;

export const dynamic = "force-dynamic";

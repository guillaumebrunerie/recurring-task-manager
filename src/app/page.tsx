"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as styles from "./tasks.css";
import * as common from "./common.css";
import { useTimestamp } from "../hooks/useTimestamp";
import { durationToString, durationUnitToString } from "@/shared/units";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Task, compareTasks, taskStatus } from "@/shared/tasks";
import { Accomplishment } from "@/shared/accomplishments";
import { AppWrapper } from "./AppWrapper";
import polyfill from "@oddbird/css-anchor-positioning/fn";

const Home = () => {
	const now = useTimestamp();
	const tasks = useQuery(api.tasks.getAll);

	useEffect(() => {
		polyfill();
	}, []);

	if (!tasks) {
		return <div className={common.loading}>Chargement...</div>;
	}

	tasks.sort((taskA, taskB) => compareTasks(taskA, taskB, now));
	const overdueTasks = tasks.filter(
		(task) => taskStatus(task, now).status === "overdue",
	);
	const dueTasks = tasks.filter(
		(task) =>
			taskStatus(task, now).status === "due" ||
			taskStatus(task, now).status === "new",
	);
	const waitingTasks = tasks.filter(
		(task) => taskStatus(task, now).status === "waiting",
	);
	const archivedTasks = tasks.filter(
		(task) => taskStatus(task, now).status === "archived",
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
			<div className={styles.taskList({ isCollapsed })}>
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

const getLocalDateTimeString = (date: Date) => {
	const pad = (n: number) => String(n).padStart(2, "0");

	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1); // getMonth is 0-based
	const day = pad(date.getDate());
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());

	return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const nbsp = "\u00A0";

const TaskCard = ({ task, now }: { task: Task; now: number }) => {
	const { status, time } = taskStatus(task, now);
	const addAccomplishment = useMutation(
		api.accomplishments.addAccomplishment,
	);

	let timeString: string;
	switch (status) {
		case "new":
			timeString = "";
			break;
		case "overdue":
			timeString = `(en retard de ${durationToString(time, task.unit)})`;
			break;
		case "due":
			timeString = `(temps restant: ${durationToString(time, task.unit)})`;
			break;
		case "waiting":
			timeString = `(à faire dans ${durationToString(time, task.unit)})`;
			break;
		case "archived":
			timeString = "(archivée)";
			break;
	}

	const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [doneTime, setDoneTime] = useState(() => {
		const now = new Date();
		return now.toISOString().slice(0, 16); // for datetime-local input
	});

	const handleSubmit = async () => {
		const timestamp = new Date(doneTime).getTime();

		try {
			await addAccomplishment({
				taskId: task.id,
				completionTime: timestamp,
			});
		} finally {
			setIsContextMenuOpen(false);
		}
	};

	const openContextMenu = () => {
		setIsContextMenuOpen(true);
		setDoneTime(getLocalDateTimeString(new Date()));
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

	const anchorName = `--context-menu-anchor-${task.id}`;

	return (
		<>
			<div
				className={
					styles.statusVariants({ status }) + " " + styles.card
				}
				onClick={openContextMenu}
				role="button"
				tabIndex={0}
			>
				<div className={styles.topRow}>
					<div className={styles.name}>
						{isPrivate && <span className={styles.lock}>🔒 </span>}
						{task.name}
					</div>
					<div className={styles.threeDots} style={{ anchorName }}>
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
			</div>
			{isContextMenuOpen && (
				<div
					className={styles.contextMenu}
					ref={containerRef}
					style={{ positionAnchor: anchorName }}
				>
					{!task.isArchived && (
						<CompleteMenuItem
							onComplete={async () => {
								setDoneTime(getLocalDateTimeString(new Date()));
								await handleSubmit();
							}}
						/>
					)}
					{!task.isArchived && (
						<DetailsMenuItem
							onClick={() => {
								setIsContextMenuOpen(false);
								setIsDetailsOpen(true);
							}}
						/>
					)}
					{!task.isArchived && <EditMenuItem task={task} />}
					{!task.isArchived && <ArchiveMenuItem task={task} />}
					{task.isArchived && <UnarchiveMenuItem task={task} />}
					{task.isArchived && <hr className={styles.separator} />}
					{task.isArchived && <DeleteMenuItem task={task} />}
				</div>
			)}
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
			onClick={async () => {
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
			onClick={async () => {
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
			onClick={async () => {
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
			onClick={async () => {
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
			<div>
				<div className={styles.deleteHistoryItem({ showDeleteButton })}>
					<span className={styles.warningText} onClick={doDelete}>
						{isCompleting && <InlineSpinner />}
						Supprimer?
					</span>
				</div>
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

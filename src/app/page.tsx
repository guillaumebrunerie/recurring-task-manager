"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as styles from "./tasks.css";
import * as common from "./common.css";
import { useTimestamp } from "../hooks/useTimestamp";
import { durationToString, durationUnitToString } from "@/shared/units";
import { useState } from "react";
import Link from "next/link";
import { Task, compareTasks, taskStatus } from "@/shared/tasks";
import { Accomplishment } from "@/shared/accomplishments";
import { AppWrapper } from "./AppWrapper";

const Home = () => {
	const now = useTimestamp();
	const tasks = useQuery(api.tasks.getAll);

	if (tasks === undefined) {
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

	return (
		<AppWrapper title="Project Happy Home">
			<div className={styles.taskPage}>
				<Section title="En retard" tasks={overdueTasks} now={now} />
				<Section title="À faire" tasks={dueTasks} now={now} />
				<Section title="En attente" tasks={waitingTasks} now={now} />
				<Link href="/task/new" className={styles.addTaskButton}>
					➕{"\uFE0E"} Nouvelle tâche
				</Link>
			</div>
		</AppWrapper>
	);
};

const Section = ({
	title,
	tasks,
	now,
}: {
	title: string;
	tasks: Task[];
	now: number;
}) => (
	<div className={styles.section2}>
		<h2 className={styles.sectionTitle2}>{title}</h2>
		<div className={styles.taskList}>
			{tasks.length > 0 ?
				tasks.map((task) => (
					<TaskCard key={task.id} task={task} now={now} />
				))
			:	"Aucune tâche à afficher."}
		</div>
	</div>
);

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
			timeString = "nouvelle tâche";
			break;
		case "overdue":
			timeString = `en retard de ${durationToString(time, task.unit)}`;
			break;
		case "due":
			timeString = `temps restant: ${durationToString(time, task.unit)}`;
			break;
		case "waiting":
			timeString = `à faire dans ${durationToString(time, task.unit)}`;
			break;
	}

	const [open, setOpen] = useState(false);
	const [doneTime, setDoneTime] = useState(() => {
		const now = new Date();
		return now.toISOString().slice(0, 16); // for datetime-local input
	});

	const handleSubmit = async () => {
		const timestamp = new Date(doneTime).getTime();

		await addAccomplishment({
			taskId: task.id,
			completionTime: timestamp,
		});

		setOpen(false);
	};

	const openModal = () => {
		setOpen(true);
		setDoneTime(getLocalDateTimeString(new Date()));
	};

	const isPrivate = task.visibleTo?.length == 1;
	const user = useQuery(api.users.getUser, {
		userId: task.toBeCompletedBy || undefined,
	});
	const imageUrl = user?.image;

	return (
		<>
			<div
				className={
					styles.statusVariants({ status }) + " " + styles.card
				}
				onClick={openModal}
				role="button"
				tabIndex={0}
			>
				<div className={styles.name}>{task.name}</div>
				<div className={styles.time}>({timeString})</div>
				{isPrivate && <div className={styles.lock}>🔒{"\uFE0E"}</div>}
				{imageUrl && (
					<img
						src={imageUrl}
						alt="Profile"
						className={styles.assignee}
					/>
				)}
			</div>
			{open && (
				<div className={styles.overlay} onClick={() => setOpen(false)}>
					<div className={styles.modalOverlay}>
						<div
							className={styles.modalContent}
							onClick={(e) => e.stopPropagation()}
						>
							<button
								className={styles.closeButton}
								onClick={() => setOpen(false)}
								aria-label="Close"
							>
								✕
							</button>
							<div className={styles.modalHeader}>
								{task.name}
								{nbsp}
							</div>
							<div>{task.description}</div>
							Intervalle:{" "}
							{durationUnitToString(task.period, task.unit)}
							{task.tolerance > 0 &&
								" ± " +
									durationUnitToString(
										task.tolerance,
										task.unit,
									)}
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
	return (
		<li className={styles.completionItem}>
			{dateTimeFormat.format(new Date(accomplishment.completionTime))}
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

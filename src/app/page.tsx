"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import * as styles from "./tasks.css";
import { useTimestamp } from "./useTimestamp";
import {
	convertDurationFromUnit,
	durationToString,
	durationUnitToString,
	getMaxTimeLeft,
	getMinTimeLeft,
	getTimeLeft,
} from "@/units";
import { TaskWithLastCompletionTime } from "../../convex/tasks";
import { useState } from "react";

type TaskStatus =
	| "new" // New task, never completed
	| "overdue" // Task is overdue
	| "due" // Task is due now
	| "waiting"; // Task does not need to be completed again yet

const taskStatus = (
	task: TaskWithLastCompletionTime,
	now: number,
): { status: TaskStatus; time: number } => {
	if (task.lastCompletionTime == null) {
		return {
			status: "new",
			time: convertDurationFromUnit(task.task.period, task.task.unit),
		};
	}
	const minTimeLeft = getMinTimeLeft(task.task, task.lastCompletionTime);
	const timeLeft = getTimeLeft(task.task, task.lastCompletionTime);
	const maxTimeLeft = getMaxTimeLeft(task.task, task.lastCompletionTime);
	if (maxTimeLeft < now) {
		return { status: "overdue", time: now - maxTimeLeft };
	}
	if (minTimeLeft > now) {
		return { status: "waiting", time: timeLeft - now };
	}
	return { status: "due", time: maxTimeLeft - now };
};

const compareTasks = (
	taskA: TaskWithLastCompletionTime,
	taskB: TaskWithLastCompletionTime,
	now: number,
) => {
	const statusA = taskStatus(taskA, now);
	const statusB = taskStatus(taskB, now);
	const statusOrder: TaskStatus[] = ["overdue", "due", "new", "waiting"];
	if (statusA.status !== statusB.status) {
		return (
			statusOrder.indexOf(statusA.status) -
			statusOrder.indexOf(statusB.status)
		);
	} else {
		switch (statusA.status) {
			case "overdue":
				return statusB.time - statusA.time;
			case "new":
				return statusA.time - statusB.time;
			case "due":
				return statusA.time - statusB.time;
			case "waiting":
				return statusA.time - statusB.time;
		}
	}
};

const Home = () => {
	const now = useTimestamp();
	const tasks = useQuery(api.tasks.getAllWithLastCompletionTime);

	const [showOther, setShowOther] = useState(false);
	if (tasks === undefined) {
		return <div>Chargement des tâches...</div>;
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
		<div className={styles.taskPage}>
			<Section title="En retard" tasks={overdueTasks} now={now} />
			<Section title="À faire" tasks={dueTasks} now={now} />
			{/* <div className={styles.otherSection}> */}
			{/* 	<button */}
			{/* 		onClick={() => setShowOther((s) => !s)} */}
			{/* 		className={styles.toggleOther} */}
			{/* 	> */}
			{/* 		{showOther ? "Masquer les autres" : "Afficher les autres"} */}
			{/* 	</button> */}
			{/* 	{showOther && ( */}
			<Section title="Autres" tasks={waitingTasks} now={now} />
			{/* 	)} */}
			{/* </div> */}
		</div>
	);
};

const Section = ({
	title,
	tasks,
	now,
}: {
	title: string;
	tasks: TaskWithLastCompletionTime[];
	now: number;
}) => (
	<div className={styles.section2}>
		<h2 className={styles.sectionTitle2}>{title}</h2>
		<div className={styles.taskList}>
			{tasks.length > 0 ?
				tasks.map((task) => (
					<Task key={task.task._id} task={task} now={now} />
				))
			:	"Aucune tâche à afficher."}
		</div>
	</div>
);

const Task = ({
	task,
	now,
}: {
	task: TaskWithLastCompletionTime;
	now: number;
}) => {
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
			timeString = `en retard de ${durationToString(time, task.task.unit)}`;
			break;
		case "due":
			timeString = `temps restant: ${durationToString(time, task.task.unit)}`;
			break;
		case "waiting":
			timeString = `à faire dans ${durationToString(time, task.task.unit)}`;
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
			taskId: task.task._id,
			completionTime: timestamp,
		});

		setOpen(false);
	};

	const openModal = () => {
		setOpen(true);
		const now = new Date();
		setDoneTime(now.toISOString().slice(0, 16));
	};

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
				<div className={styles.name}>{task.task.task}</div>
				<div className={styles.time}>({timeString})</div>
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
								aria-label="Fermer"
							>
								✕
							</button>
							<div className={styles.modalHeader}>
								{task.task.task}
							</div>
							Intervalle:{" "}
							{durationUnitToString(
								task.task.period,
								task.task.unit,
							)}
							{task.task.tolerance > 0 &&
								" ± " +
									durationUnitToString(
										task.task.tolerance,
										task.task.unit,
									)}
							<label className={styles.label}>
								Effectué le :
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
									Marquer comme effectué
								</button>
							</div>
							<TaskHistory task={task} />
						</div>
					</div>
				</div>
			)}
		</>
	);
};

const TaskHistory = ({ task }: { task: TaskWithLastCompletionTime }) => {
	const history = useQuery(api.accomplishments.getTaskHistory, {
		taskId: task.task._id,
	});
	return (
		<div className={styles.section}>
			<h3 className={styles.sectionTitle}>Historique</h3>
			{history ?
				history.length > 0 ?
					<ul className={styles.completionList}>
						{history.map((accomplishment) => (
							<li
								key={accomplishment._id}
								className={styles.completionItem}
							>
								{new Date(
									accomplishment.completionTime,
								).toLocaleString("fr-FR", {
									dateStyle: "medium",
									timeStyle: "short",
								})}
							</li>
						))}
					</ul>
				:	"Pas d'historique pour cette tâche."
			:	"Chargement de l'historique..."}
		</div>
	);
};

export default Home;

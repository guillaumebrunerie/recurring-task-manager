"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as styles from "./page.css";
import * as common from "./common.css";
import { useTimestamp } from "../hooks/useTimestamp";
import { Suspense, useState } from "react";
import { type Task, compareTasks, taskStatus } from "@/shared/tasks";
import { AppWrapper } from "./AppWrapper";
import useDelayedTruth from "@/hooks/useDelayedTruth";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { TaskCard } from "./TaskCard";
import { BlueButton } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Edit } from "./Edit";
import { parseAsBoolean, useQueryState } from "nuqs";

const HomeContents = () => {
	const now = useTimestamp(15 * 60 * 1000); // Update every 15 minutes
	const tasks = useQuery(api.tasks.getAll);

	const [taskIdUrl, setTaskIdUrl] = useQueryState("task");
	const [isEditing, setIsEditing] = useQueryState(
		"edit",
		parseAsBoolean.withDefault(false),
	);
	const isNewTaskOpen = !taskIdUrl && isEditing;
	const closeModal = () => {
		setTaskIdUrl(null, { history: "push" });
		setIsEditing(false, { history: "push" });
	};
	const openNewTask = () => {
		setTaskIdUrl(null, { history: "push" });
		setIsEditing(true, { history: "push" });
	};

	const allUsers = useQuery(api.users.getAll);
	const currentUser = useQuery(api.users.getCurrentUser);

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
				<BlueButton onClick={openNewTask}>Nouvelle tâche</BlueButton>
			}
		>
			<div className={styles.taskPage}>
				{currentUser &&
					[...overdueTasks, ...dueTasks].every(
						(task) =>
							!task.toBeCompletedBy.some(
								(u) => u.id == currentUser.id,
							),
					) && <Congratulations />}
				<Section title="En retard" tasks={overdueTasks} now={now} />
				<Section title="À faire" tasks={dueTasks} now={now} />
				<Section
					title="En attente"
					tasks={waitingTasks}
					now={now}
					startCollapsed
				/>
				<Section
					title="Corbeille"
					tasks={archivedTasks}
					now={now}
					startCollapsed
				/>

				{isNewTaskOpen && (
					<Modal title="Nouvelle tâche" onClose={closeModal}>
						<Edit
							task={undefined}
							user={currentUser || undefined}
							allUsers={allUsers}
							closeModal={closeModal}
						/>
					</Modal>
				)}
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
		<div className={styles.section}>
			<h2
				className={styles.sectionTitle}
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

const Congratulations = () => {
	return (
		<div className={styles.taskList({ isCollapsed: false })}>
			Aucune tâche à effectuer!
		</div>
	);
};

const Home = () => {
	return (
		<Suspense>
			<HomeContents />
		</Suspense>
	);
};

export default Home;

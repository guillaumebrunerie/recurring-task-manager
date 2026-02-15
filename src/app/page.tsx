"use client";

import { assignInlineVars } from "@vanilla-extract/dynamic";
import classNames from "classnames";
import { useQuery } from "convex/react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { Suspense, useEffect, useState } from "react";

import { api } from "@/convex/_generated/api";

import { compareTasks, taskStatus, type Task } from "@/shared/tasks";

import { BlueButton } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useTimestamp } from "@/hooks/useTimestamp";

import { AppWrapper } from "./AppWrapper";
import * as common from "./common.css";
import { Edit } from "./Edit";
import * as styles from "./page.css";
import { TaskCard } from "./TaskCard";

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
		void setTaskIdUrl(null, { history: "push" });
		void setIsEditing(false, { history: "push" });
	};
	const openNewTask = () => {
		void setTaskIdUrl(null, { history: "push" });
		void setIsEditing(true, { history: "push" });
	};

	const allUsers = useQuery(api.users.getAllUsersQuery);
	const currentUser = useQuery(api.users.getCurrentUserQuery);

	useEffect(() => {
		if (!tasks) {
			return;
		}
		const lateCount = tasks.filter(
			(task) =>
				["veryLate", "late", "dueNow"].includes(
					taskStatus(task, now),
				) &&
				task.toBeCompletedBy.some((user) => user.id == currentUser?.id),
		).length;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		void navigator.setAppBadge?.(lateCount);
	}, [tasks, currentUser, now]);

	if (!tasks || !allUsers) {
		return <div className={common.loading}>Chargement...</div>;
	}

	tasks.sort((taskA, taskB) => compareTasks(taskA, taskB, now));
	const dueTasks = tasks.filter((task) =>
		["veryLate", "late", "dueNow"].includes(taskStatus(task, now)),
	);
	const waitingTasks = tasks.filter((task) =>
		["dueSoon", "waiting"].includes(taskStatus(task, now)),
	);
	const archivedTasks = tasks.filter(
		(task) => taskStatus(task, now) === "archived",
	);

	return (
		<AppWrapper
			title="Happy Home"
			footer={
				<BlueButton onClick={openNewTask}>Nouvelle tâche</BlueButton>
			}
		>
			<div className={styles.taskPage}>
				{currentUser &&
					dueTasks.every(
						(task) =>
							!task.toBeCompletedBy.some(
								(u) => u.id == currentUser.id,
							),
					) && <Congratulations />}
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

				{isNewTaskOpen && currentUser && (
					<Modal title="Nouvelle tâche" onClose={closeModal}>
						<Edit
							task={undefined}
							user={currentUser}
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
	if (tasks.length == 0) {
		return null;
	}
	return (
		<div className={styles.section}>
			<h2
				className={styles.sectionTitle}
				onClick={() => setIsCollapsed(!isCollapsed)}
			>
				<span
					className={classNames(
						styles.arrow,
						isCollapsed && styles.arrowCollapsed,
					)}
				>
					▼
				</span>
				{isCollapsed ? ` ${title} (${tasks.length})` : ` ${title}`}
			</h2>
			<div
				className={classNames(
					styles.taskList,
					isCollapsed && styles.taskListCollapsed,
				)}
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
	return <div className={styles.taskList}>Aucune tâche à effectuer!</div>;
};

const Home = () => {
	return (
		<Suspense>
			<HomeContents />
		</Suspense>
	);
};

export default Home;

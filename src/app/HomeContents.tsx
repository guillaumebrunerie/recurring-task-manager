"use client";

import { assignInlineVars } from "@vanilla-extract/dynamic";
import classNames from "classnames";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { Suspense, useEffect, useState } from "react";

import { api } from "@/convex/_generated/api";

import { compareTasks, taskStatus, type Task } from "@/shared/tasks";
import type { User } from "@/shared/users";

import { BlueButton } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useTimestamp } from "@/hooks/useTimestamp";

import { AppWrapper } from "./AppWrapper";
import { Edit } from "./Edit";
import * as styles from "./page.css";
import { TaskCard } from "./TaskCard";

const HomeContents = ({
	preloadedTasks,
	preloadedAllUsers,
	preloadedCurrentUser,
}: {
	preloadedTasks: Preloaded<typeof api.tasks.getAll>;
	preloadedAllUsers: Preloaded<typeof api.users.getAllUsersQuery>;
	preloadedCurrentUser: Preloaded<typeof api.users.getCurrentUserQuery>;
}) => {
	const now = useTimestamp(15 * 60 * 1000); // Update every 15 minutes
	const tasks = usePreloadedQuery(preloadedTasks);
	const allUsers = usePreloadedQuery(preloadedAllUsers);
	const currentUser = usePreloadedQuery(preloadedCurrentUser);

	const [taskIdUrl, setTaskIdUrl] = useQueryState("task");
	const [isEditing, setIsEditing] = useQueryState(
		"edit",
		parseAsBoolean.withDefault(false),
	);
	const [search, setSearch] = useQueryState("search", {
		defaultValue: "",
		clearOnDefault: true,
	});
	const isNewTaskOpen = !taskIdUrl && isEditing;
	const closeModal = () => {
		void setTaskIdUrl(null, { history: "push" });
		void setIsEditing(false, { history: "push" });
	};
	const openNewTask = () => {
		void setTaskIdUrl(null, { history: "push" });
		void setIsEditing(true, { history: "push" });
	};

	useEffect(() => {
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

	tasks.sort((taskA, taskB) => compareTasks(taskA, taskB, now));
	const query = search.toLowerCase();
	const matchesSearch = (task: Task) =>
		task.name.toLowerCase().includes(query);
	const dueTasks = tasks.filter(
		(task) =>
			["veryLate", "late", "dueNow"].includes(taskStatus(task, now)) &&
			matchesSearch(task),
	);
	const waitingTasks = tasks.filter(
		(task) =>
			["dueSoon", "waiting"].includes(taskStatus(task, now)) &&
			matchesSearch(task),
	);
	const archivedTasks = tasks.filter(
		(task) => taskStatus(task, now) === "archived" && matchesSearch(task),
	);

	return (
		<AppWrapper
			title="Happy Home"
			search={search}
			onSearchChange={(value) =>
				void setSearch(value, { history: "replace" })
			}
			footer={
				<BlueButton onClick={openNewTask}>Nouvelle tâche</BlueButton>
			}
			currentUser={currentUser}
		>
			<div className={styles.taskPage}>
				{!search &&
					currentUser &&
					dueTasks.every(
						(task) =>
							!task.toBeCompletedBy.some(
								(u) => u.id == currentUser.id,
							),
					) && <Congratulations />}
				{search &&
					dueTasks.length === 0 &&
					waitingTasks.length === 0 &&
					archivedTasks.length === 0 && (
						<div className={styles.taskList}>
							Aucun résultat pour « {search} ».
						</div>
					)}
				{currentUser && (
					<>
						<Section
							key={`due-${!!search}`}
							title="À faire"
							tasks={dueTasks}
							now={now}
							allUsers={allUsers}
							currentUser={currentUser}
						/>
						<Section
							key={`waiting-${!!search}`}
							title="En attente"
							tasks={waitingTasks}
							now={now}
							startCollapsed={!search}
							allUsers={allUsers}
							currentUser={currentUser}
						/>
						<Section
							key={`archived-${!!search}`}
							title="Corbeille"
							tasks={archivedTasks}
							now={now}
							startCollapsed={!search}
							allUsers={allUsers}
							currentUser={currentUser}
						/>
					</>
				)}

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
	allUsers,
	currentUser,
}: {
	title: string;
	tasks: Task[];
	now: number;
	startCollapsed?: boolean;
	allUsers: User[];
	currentUser: User;
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
						<TaskCard
							key={task.id}
							task={task}
							now={now}
							allUsers={allUsers}
							currentUser={currentUser}
						/>
					))
				:	"Aucune tâche à afficher."}
			</div>
		</div>
	);
};

const Congratulations = () => {
	return <div className={styles.taskList}>Aucune tâche à effectuer!</div>;
};

export const Home = ({
	preloadedTasks,
	preloadedAllUsers,
	preloadedCurrentUser,
}: {
	preloadedTasks: Preloaded<typeof api.tasks.getAll>;
	preloadedAllUsers: Preloaded<typeof api.users.getAllUsersQuery>;
	preloadedCurrentUser: Preloaded<typeof api.users.getCurrentUserQuery>;
}) => {
	return (
		<Suspense>
			<HomeContents
				preloadedTasks={preloadedTasks}
				preloadedAllUsers={preloadedAllUsers}
				preloadedCurrentUser={preloadedCurrentUser}
			/>
		</Suspense>
	);
};

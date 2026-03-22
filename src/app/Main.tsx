"use client";

import { assignInlineVars } from "@vanilla-extract/dynamic";
import classNames from "classnames";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";

import type { api } from "@/convex/_generated/api";

import { compareTasks, taskStatus, type Task } from "@/shared/tasks";
import type { User } from "@/shared/users";

import { SignIn } from "@/components/SignIn";
import { useTimestamp } from "@/hooks/useTimestamp";

import { NewTask } from "./Edit";
import * as styles from "./main.css";
import { TaskCard } from "./TaskCard";

type MainClientProps = {
	preloadedTasks: Preloaded<typeof api.tasks.getAll>;
	preloadedUser: Preloaded<typeof api.users.getCurrentUserQuery>;
	preloadedAllUsers: Preloaded<typeof api.users.getAllUsersQuery>;
};

export const MainClient = ({
	preloadedTasks,
	preloadedUser,
	preloadedAllUsers,
}: MainClientProps) => {
	const tasks = usePreloadedQuery(preloadedTasks);
	const user = usePreloadedQuery(preloadedUser);
	const allUsers = usePreloadedQuery(preloadedAllUsers);

	if (!user) {
		return <SignIn />;
	}

	return (
		<>
			<TaskList tasks={tasks} currentUser={user} allUsers={allUsers} />
			<NewTask user={user} allUsers={allUsers} />
		</>
	);
};

type TaskListProps = { tasks: Task[]; currentUser: User; allUsers: User[] };

const TaskList = ({ tasks, currentUser, allUsers }: TaskListProps) => {
	const now = useTimestamp(15 * 60 * 1000); // Update every 15 minutes

	const [search, _] = useQueryState("search", {
		defaultValue: "",
		clearOnDefault: true,
	});

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
		<>
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
		</>
	);
};

const Congratulations = () => {
	return <div className={styles.taskList}>Aucune tâche à effectuer!</div>;
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

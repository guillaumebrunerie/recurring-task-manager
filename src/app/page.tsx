"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as styles from "./page.css";
import * as common from "./common.css";
import { useTimestamp } from "../hooks/useTimestamp";
import { useState } from "react";
import Link from "next/link";
import { Task, compareTasks, taskStatus } from "@/shared/tasks";
import { AppWrapper } from "./AppWrapper";
import useDelayedTruth from "@/hooks/useDelayedTruth";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { TaskCard } from "./TaskCard";

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
					title="Corbeille"
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

export default Home;

export const dynamic = "force-dynamic";

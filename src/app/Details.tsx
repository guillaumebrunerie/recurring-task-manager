import { toLocalDateTimeString } from "@/shared/localDateTime";
import { defaultCompletedBy, type Task } from "@/shared/tasks";
import { useState, useTransition } from "react";
import * as styles from "./details.css";
import { durationUnitToString, timeToString } from "@/shared/units";
import { Spinner } from "@/components/Spinner";
import type { Accomplishment } from "@/shared/accomplishments";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BlueButton, GreenButton } from "@/components/Button";
import type { Id } from "@/convex/_generated/dataModel";
import { UserSelector } from "@/components/UserSelector";
import { UserIndicators } from "./UserIndicators";
import type { User } from "@/shared/users";
import classNames from "classnames";

type DetailsProps = {
	task: Task;
	history?: Accomplishment[];
	currentUser: User;
	handleSubmit: (
		doneTime?: string,
		completedBy?: Id<"users">[],
	) => Promise<void>;
	onEdit: () => void;
};

export const Details = ({
	task,
	history,
	currentUser,
	handleSubmit,
	onEdit,
}: DetailsProps) => {
	const [isOptionsCollapsed, setIsOptionsCollapsed] = useState(true);
	const [isCompleting, startTransition] = useTransition();
	const [doneTime, setDoneTime] = useState(toLocalDateTimeString(Date.now()));
	const [completedBy, setCompletedBy] = useState<Set<Id<"users">>>(
		new Set([...defaultCompletedBy(task, currentUser.id)]),
	);
	return (
		<>
			<div className={styles.stuff}>
				{task.description && (
					<p className={styles.description}>{task.description}</p>
				)}
				<div className={styles.infoRow}>
					<div className={styles.stuff}>
						{task.period !== 0 && (
							<em>
								Intervalle:{" "}
								{durationUnitToString(task.period, task.unit)}
								{task.tolerance > 0 &&
									" ± " +
										durationUnitToString(
											task.tolerance,
											task.toleranceUnit,
										)}
							</em>
						)}
						{task.toBeDoneTime !== undefined && (
							<span>
								À effectuer{" "}
								{timeToString(
									task.toBeDoneTime,
									task.toleranceUnit,
								)}
								.
							</span>
						)}
					</div>
					<BlueButton onClick={onEdit}>Éditer</BlueButton>
				</div>
			</div>
			<TaskHistory history={history} />
			<div className={styles.optionsSection}>
				<div className={styles.modalButtons2}>
					<div
						className={classNames(
							styles.optionsButton,
							isOptionsCollapsed && styles.optionsButtonCollapsed,
						)}
						onClick={() =>
							setIsOptionsCollapsed(!isOptionsCollapsed)
						}
					>
						<span
							className={classNames(
								styles.arrow,
								isOptionsCollapsed && styles.arrowCollapsed,
							)}
						>
							▼
						</span>
						Options
					</div>
					<GreenButton
						onClick={() => {
							startTransition(async () => {
								await handleSubmit(
									isOptionsCollapsed ? undefined : doneTime,
									isOptionsCollapsed ? undefined : (
										[...completedBy]
									),
								);
							});
						}}
					>
						{isCompleting && <Spinner />}
						Marquer comme effectuée
					</GreenButton>
				</div>
				<div
					className={classNames(
						styles.options,
						isOptionsCollapsed && styles.optionsCollapsed,
					)}
				>
					<label className={styles.label}>
						Effectuée le :
						<input
							type="datetime-local"
							value={doneTime}
							onChange={(e) => setDoneTime(e.target.value)}
							className={styles.input}
						/>
					</label>
					<label className={styles.label}>
						Effectuée par:
						<UserSelector
							users={task.responsibleFor}
							selected={completedBy}
							onChange={setCompletedBy}
						/>
					</label>
				</div>
			</div>
		</>
	);
};

type TaskHistoryProps = { history: Accomplishment[] | undefined };

const TaskHistory = ({ history }: TaskHistoryProps) => {
	const [isCollapsed, setIsCollapsed] = useState(true);
	return (
		<div className={styles.historySection}>
			<div
				className={styles.modalButtons2}
				onClick={() => setIsCollapsed(!isCollapsed)}
			>
				<div
					className={classNames(
						styles.optionsButton,
						isCollapsed && styles.optionsButtonCollapsed,
					)}
				>
					<span
						className={classNames(
							styles.arrow,
							isCollapsed && styles.arrowCollapsed,
						)}
					>
						▼
					</span>
					Historique
				</div>
			</div>
			<div
				className={classNames(
					styles.history,
					isCollapsed && styles.historyCollapsed,
				)}
			>
				{history ?
					history.length > 0 ?
						<ul className={styles.completionList}>
							{history.map((accomplishment) => (
								<TaskHistoryItem
									key={accomplishment.id}
									accomplishment={accomplishment}
								/>
							))}
						</ul>
					:	"Pas d'historique pour cette tâche."
				:	<ul className={styles.completionList}>Loading...</ul>}
			</div>
		</div>
	);
};

const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", {
	dateStyle: "full",
	timeStyle: "short",
});

type TaskHistoryItemProps = { accomplishment: Accomplishment };

const TaskHistoryItem = ({ accomplishment }: TaskHistoryItemProps) => {
	const [isCompleting, startTransition] = useTransition();
	const deleteAccomplishment = useMutation(
		api.accomplishments.deleteAccomplishment,
	);
	const [showDeleteButton, setShowDeleteButton] = useState(false);
	return (
		<li
			className={styles.completionItem}
			onClick={() => {
				setShowDeleteButton(!showDeleteButton);
			}}
		>
			<div className={styles.deleteHistoryItem}>
				<span
					className={classNames(
						styles.deleteHistoryItemButton,
						showDeleteButton && styles.showDeleteButton,
					)}
					onClick={() => {
						startTransition(async () => {
							await deleteAccomplishment({
								accomplishmentId: accomplishment.id,
							});
						});
					}}
				>
					{isCompleting && <Spinner />}
					Supprimer?
				</span>
				<span
					className={classNames(
						accomplishment.isFailed && styles.failedCompletionItem,
					)}
				>
					{dateTimeFormat.format(
						new Date(accomplishment.completionTime),
					)}
				</span>
			</div>
			<UserIndicators
				allUsers={accomplishment.completedBy}
				enabledUsers={accomplishment.completedBy}
			/>
		</li>
	);
};

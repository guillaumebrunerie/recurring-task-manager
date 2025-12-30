import { toLocalDateTimeString } from "@/shared/localDateTime";
import { defaultCompletedBy, type Task } from "@/shared/tasks";
import { useState } from "react";
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
	history: Accomplishment[];
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
	const [isCompleting, setIsCompleting] = useState(false);
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
						className={styles.optionsButton({
							isCollapsed: isOptionsCollapsed,
						})}
						onClick={() =>
							setIsOptionsCollapsed(!isOptionsCollapsed)
						}
					>
						<span
							className={styles.arrow({
								isCollapsed: isOptionsCollapsed,
							})}
						>
							▼
						</span>
						Options
					</div>
					<GreenButton
						onClick={async () => {
							setIsCompleting(true);
							try {
								await handleSubmit(
									isOptionsCollapsed ? undefined : doneTime,
									isOptionsCollapsed ? undefined : (
										[...completedBy]
									),
								);
							} finally {
								setIsCompleting(false);
							}
						}}
					>
						{isCompleting && <Spinner />}
						Marquer comme effectuée
					</GreenButton>
				</div>
				<div
					className={styles.options({
						isCollapsed: isOptionsCollapsed,
					})}
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

type TaskHistoryProps = { history: Accomplishment[] };

const TaskHistory = ({ history }: TaskHistoryProps) => {
	const [isCollapsed, setIsCollapsed] = useState(true);
	return (
		<div className={styles.historySection}>
			<div
				className={styles.modalButtons2}
				onClick={() => setIsCollapsed(!isCollapsed)}
			>
				<div className={styles.optionsButton({ isCollapsed })}>
					<span className={styles.arrow({ isCollapsed })}>▼</span>
					Historique
				</div>
			</div>
			<div className={styles.history({ isCollapsed })}>
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

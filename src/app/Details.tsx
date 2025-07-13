import { toLocalDateTimeString } from "@/shared/localDateTime";
import { Task } from "@/shared/tasks";
import { useState } from "react";
import * as styles from "./details.css";
import { durationUnitToString, timeToString } from "@/shared/units";
import { Spinner } from "@/components/Spinner";
import { Accomplishment } from "@/shared/accomplishments";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BlueButton, GreenButton } from "@/components/Button";

type DetailsProps = {
	task: Task;
	handleSubmit: (doneTime?: string) => Promise<void>;
	onEdit: () => void;
};

export const Details = ({ task, handleSubmit, onEdit }: DetailsProps) => {
	const [isOptionsCollapsed, setIsOptionsCollapsed] = useState(true);
	const [isCompleting, setIsCompleting] = useState(false);
	const [doneTime, setDoneTime] = useState(toLocalDateTimeString(Date.now()));
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
											task.unit,
										)}
							</em>
						)}
						{task.toBeDoneTime !== undefined && (
							<span>
								À effectuer{" "}
								{timeToString(task.toBeDoneTime, task.unit)}.
							</span>
						)}
					</div>
					<BlueButton onClick={onEdit}>Éditer</BlueButton>
				</div>
			</div>
			<TaskHistory task={task} />
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
				</div>
			</div>
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

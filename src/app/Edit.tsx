import { type ReactNode, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { type TimeUnit, unitToStringPlural } from "@/shared/units";
import * as styles from "./edit.css";
import { UserSelector } from "@/components/UserSelector";
import {
	fromLocalDateTimeString,
	toLocalDateTimeString,
} from "@/shared/localDateTime";
import type { Task } from "@/shared/tasks";
import type { User } from "@/shared/users";
import { BlueButton } from "@/components/Button";
import { Spinner } from "@/components/Spinner";

const visibleUnits: TimeUnit[] = [
	// "seconds",
	"minutes",
	"hours",
	"days",
	"weeks",
	"months",
	"years",
];

const Field = ({ title, children }: { title: string; children: ReactNode }) => {
	return (
		<div className={styles.field}>
			<label className={styles.label}>{title}</label>
			{children}
		</div>
	);
};

type EditProps = {
	task?: Task;
	user: User;
	allUsers: User[];
	closeModal: () => void;
};

export const Edit = ({ task, user, allUsers, closeModal }: EditProps) => {
	// The name of the task
	const [name, setName] = useState(task?.name || "");

	// The description of the task
	const [description, setDescription] = useState<string | undefined>(
		task?.description,
	);

	// How often the task should be done, with the unit and the tolerance
	const [period, setPeriod] = useState(task?.period.toString() || "1");
	const [unit, setUnit] = useState<TimeUnit>(task?.unit || "days");
	const [toleranceUnit, setToleranceUnit] = useState<TimeUnit>(
		task?.toleranceUnit || "days",
	);
	const [tolerance, setTolerance] = useState(
		task?.tolerance.toString() || "0",
	);

	// Who the task is visible to
	const [visibleTo, setVisibleTo_] = useState<Set<Id<"users">>>(
		new Set((task?.visibleTo || allUsers)?.map((u) => u.id)),
	);
	const setVisibleTo = (users: Set<Id<"users">>) => {
		if (!user) {
			return;
		}
		setVisibleTo_(users);
		setResponsibleFor_(responsibleFor.intersection(users));
	};

	// Who is responsible for the task
	const [responsibleFor, setResponsibleFor_] = useState<Set<Id<"users">>>(
		new Set((task?.responsibleFor || allUsers)?.map((u) => u.id)),
	);
	const setResponsibleFor = (users: Set<Id<"users">>) => {
		if (!user) {
			return;
		}
		setResponsibleFor_(users);
	};

	// When the task should be done
	const [toBeDoneTime, setToBeDoneTime] = useState(
		toLocalDateTimeString(task?.toBeDoneTime || Date.now()),
	);
	const [isTaskDisabled, setIsTaskDisabled] = useState(
		!!task && task?.toBeDoneTime === undefined,
	);

	const [isTaskOneTime, setIsTaskOneTime] = useState(
		!!task && task.period == 0,
	);

	const [isTaskJoint, setIsTaskJoint] = useState(!!task && task.isJoint);
	const [isFixedSchedule, setIsFixedSchedule] = useState(
		!!task && task.isFixedSchedule,
	);

	// Transient state when saving the task
	const [isCompleting, setIsCompleting] = useState(false);

	const saveTask = useMutation(api.tasks.saveTask);
	const handleSave = async () => {
		if (!user || !name) {
			return;
		}
		await saveTask({
			id: task?.id,
			name,
			description,
			unit,
			period: isTaskOneTime ? 0 : Number(period),
			toleranceUnit,
			tolerance: Number(tolerance),
			visibleTo: [...new Set([...visibleTo, user.id])],
			responsibleFor: [...responsibleFor],
			isJoint: isTaskJoint,
			isFixedSchedule,
			toBeDoneTime:
				isTaskDisabled ? undefined : (
					fromLocalDateTimeString(toBeDoneTime)
				),
		});
		closeModal();
	};

	const updateTolerance = (period: number, unit: TimeUnit) => {
		if (isNaN(period)) {
			return;
		}
		switch (unit) {
			case "seconds":
			case "minutes":
			case "hours":
			case "days":
				setToleranceUnit(unit);
				setTolerance(`${Math.floor(period / 5)}`);
				break;
			case "weeks":
				setToleranceUnit("days");
				setTolerance(`${Math.floor((period * 7) / 5)}`);
				break;
			case "months":
				setToleranceUnit("weeks");
				setTolerance(`${Math.floor((period * 4) / 5)}`);
				break;
			case "years":
				setToleranceUnit("months");
				setTolerance(`${Math.floor((period * 12) / 5)}`);
				break;
		}
	};

	return (
		<div className={styles.formWrapper}>
			<Field title="Nom">
				<input
					className={styles.input}
					value={name}
					placeholder="Nom de la tâche"
					onChange={(e) => setName(e.target.value)}
				/>
			</Field>
			<Field title="Description">
				<textarea
					className={styles.textarea}
					value={description}
					placeholder="Description"
					onChange={(e) =>
						setDescription(e.target.value || undefined)
					}
				/>
			</Field>
			<Field title="Périodicité">
				<div className={styles.periodRow}>
					<input
						className={styles.inputSmall}
						type={isTaskOneTime ? "string" : "number"}
						inputMode="numeric"
						min={1}
						disabled={isTaskOneTime}
						value={isTaskOneTime ? "—" : period}
						onChange={(e) => {
							setPeriod(e.target.value);
							updateTolerance(Number(e.target.value), unit);
						}}
					/>
					<select
						className={styles.input}
						disabled={isTaskOneTime}
						value={isTaskOneTime ? "—" : unit}
						onChange={(e) => {
							setUnit(e.target.value as TimeUnit);
							updateTolerance(
								Number(period),
								e.target.value as TimeUnit,
							);
						}}
					>
						{isTaskOneTime ?
							[
								<option key="—" value="—">
									—
								</option>,
							]
						:	visibleUnits.map((unit) => (
								<option key={unit} value={unit}>
									{unitToStringPlural[unit]}
								</option>
							))
						}
					</select>
					±
					<input
						className={styles.inputSmall}
						type="number"
						inputMode="numeric"
						min="0"
						value={tolerance}
						onChange={(e) => setTolerance(e.target.value)}
					/>
					<select
						className={styles.input}
						value={toleranceUnit}
						onChange={(e) =>
							setToleranceUnit(e.target.value as TimeUnit)
						}
					>
						{visibleUnits.map((unit) => (
							<option key={unit} value={unit}>
								{unitToStringPlural[unit]}
							</option>
						))}
					</select>
				</div>
				<label className={styles.checkboxLabel}>
					<input
						type="checkbox"
						checked={isTaskOneTime}
						onChange={(e) => {
							setIsTaskOneTime(e.target.checked);
						}}
					/>
					Tâche non récurrente
				</label>
			</Field>
			<Field title="À effectuer le">
				<input
					type="datetime-local"
					disabled={isTaskDisabled}
					value={toBeDoneTime}
					onChange={(e) => setToBeDoneTime(e.target.value)}
					className={styles.input + " " + styles.dateTimeInput}
				/>
				<label className={styles.checkboxLabel}>
					<input
						type="checkbox"
						checked={isFixedSchedule}
						onChange={(e) => {
							setIsFixedSchedule(e.target.checked);
						}}
						disabled={isTaskDisabled}
					/>
					Planning fixe
				</label>
				<label className={styles.checkboxLabel}>
					<input
						type="checkbox"
						checked={isTaskDisabled}
						onChange={(e) => {
							setIsTaskDisabled(e.target.checked);
						}}
					/>
					Désactiver la tâche
				</label>
			</Field>
			<Field title="Visible pour">
				<UserSelector
					users={allUsers || []}
					selected={
						user ? new Set([...visibleTo, user.id]) : visibleTo
					}
					onChange={setVisibleTo}
				/>
			</Field>
			<Field title="Responsable(s)">
				<UserSelector
					users={(allUsers || []).filter(
						(u) => visibleTo.has(u.id) || u.id === user?.id,
					)}
					hasPrimary={!isTaskJoint}
					selected={responsibleFor}
					onChange={setResponsibleFor}
				/>
				<label className={styles.checkboxLabel}>
					<input
						type="checkbox"
						checked={isTaskJoint}
						onChange={(e) => {
							setIsTaskJoint(e.target.checked);
						}}
						disabled={responsibleFor.size < 2}
					/>
					Tâche commune
				</label>
			</Field>
			<div className={styles.bottomBar}>
				<BlueButton
					onClick={async () => {
						setIsCompleting(true);
						try {
							await handleSave();
						} finally {
							setIsCompleting(false);
						}
					}}
				>
					{isCompleting && <Spinner />}
					Enregistrer
				</BlueButton>
			</div>
		</div>
	);
};

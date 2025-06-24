"use client";

import { useParams, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TimeUnit } from "@/shared/units";
import * as styles from "./styles.css";
import * as common from "@/app/common.css";
import { UserSelector } from "@/components/UserSelector";
import { AppWrapper } from "@/app/AppWrapper";

const visibleUnits: TimeUnit[] = ["minutes", "hours", "days", "weeks"];

const Field = ({ title, children }: { title: string; children: ReactNode }) => {
	return (
		<div className={styles.field}>
			<label className={styles.label}>{title}</label>
			{children}
		</div>
	);
};

const TaskFormPage = () => {
	const { id } = useParams();
	const router = useRouter();

	const isNew = id === "new";
	const apiId = isNew ? undefined : (id as Id<"tasks">);
	const existingTask = useQuery(api.tasks.get, {
		id: apiId,
	});
	const saveTask = useMutation(api.tasks.saveTask);

	const allUsers = useQuery(api.users.getAll);

	const [name, setName] = useState("");
	const [description, setDescription] = useState<string | undefined>();
	const [period, setPeriod] = useState("1");
	const [unit, setUnit] = useState<TimeUnit>("days");
	const [tolerance, setTolerance] = useState("0");
	const [isLoading, setIsLoading] = useState(!isNew);

	const user = useQuery(api.users.getCurrentUser);
	const [visibleTo, setVisibleTo_] = useState<Set<Id<"users">>>(new Set());
	const [responsibleFor, setResponsibleFor_] = useState<Set<Id<"users">>>(
		new Set(),
	);

	const setVisibleTo = (users: Set<Id<"users">>) => {
		if (!user) {
			return;
		}
		setVisibleTo_(users);
		setResponsibleFor_(responsibleFor.intersection(users));
	};

	const setResponsibleFor = (users: Set<Id<"users">>) => {
		if (!user) {
			return;
		}
		setResponsibleFor_(users);
	};

	useEffect(() => {
		if (existingTask) {
			setName(existingTask.name);
			setDescription(existingTask.description);
			setPeriod(existingTask.period.toString());
			setUnit(existingTask.unit);
			setTolerance(existingTask.tolerance.toString());
			setVisibleTo_(new Set(existingTask.visibleTo));
			setResponsibleFor_(new Set(existingTask.responsibleFor));
			setIsLoading(false);
		}
	}, [existingTask]);

	useEffect(() => {
		if (allUsers && isNew) {
			setVisibleTo_(new Set(allUsers.map((u) => u.id)));
			setResponsibleFor_(new Set(allUsers.map((u) => u.id)));
		}
	}, [allUsers, isNew]);

	const handleSave = async () => {
		if (!user) {
			return;
		}
		await saveTask({
			id: apiId,
			name,
			description,
			period: Number(period),
			unit,
			tolerance: Number(tolerance),
			visibleTo: [...visibleTo, user.id],
			responsibleFor: [...responsibleFor],
		});
		router.push("/");
	};

	if (isLoading) {
		return <div className={common.loading}>Chargement...</div>;
	}

	return (
		<AppWrapper
			title={isNew ? "Nouvelle tâche" : "Modifier la tâche"}
			withBackButton
			footer={
				<button className={styles.addTaskButton} onClick={handleSave}>
					{isNew ? "Créer la tâche" : "Enregistrer"}
				</button>
			}
		>
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
							className={styles.input}
							type="number"
							min="1"
							value={period}
							onChange={(e) => {
								setPeriod(e.target.value);
								if (!isNaN(Number(e.target.value))) {
									setTolerance(
										`${Math.floor(Number(e.target.value) / 3)}`,
									);
								}
							}}
						/>
						±
						<input
							className={styles.input}
							type="number"
							min="0"
							value={tolerance}
							onChange={(e) => setTolerance(e.target.value)}
						/>
						<select
							className={styles.input}
							value={unit}
							onChange={(e) =>
								setUnit(e.target.value as TimeUnit)
							}
						>
							{visibleUnits.map((unit) => (
								<option key={unit} value={unit}>
									{unit}
								</option>
							))}
						</select>
					</div>
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
						selected={responsibleFor}
						onChange={setResponsibleFor}
					/>
				</Field>
			</div>
		</AppWrapper>
	);
};

export default TaskFormPage;

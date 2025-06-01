"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { TimeUnit } from "@/units";
import * as styles from "./styles.css";
import * as common from "@/app/common.css";

const units: TimeUnit[] = ["minutes", "hours", "days", "weeks"];

const BackButton = () => {
	const router = useRouter();
	return (
		<button onClick={() => router.back()} className={styles.backButton}>
			← Retour
		</button>
	);
};
export default function TaskFormPage() {
	const { id } = useParams();
	const router = useRouter();

	const isNew = id === "new";
	const existingTask = useQuery(api.tasks.get, {
		id: isNew ? undefined : (id as Id<"tasks">),
	});

	const saveTask = useMutation(api.tasks.saveTask);

	const [name, setName] = useState("");
	const [description, setDescription] = useState<string | undefined>();
	const [period, setPeriod] = useState("1");
	const [unit, setUnit] = useState<TimeUnit>("days");
	const [tolerance, setTolerance] = useState("0");
	const [isLoading, setIsLoading] = useState(!isNew);

	useEffect(() => {
		if (existingTask) {
			setName(existingTask.name);
			setDescription(existingTask.description);
			setPeriod(existingTask.period.toString());
			setUnit(existingTask.unit);
			setTolerance(existingTask.tolerance.toString());
			setIsLoading(false);
		}
	}, [existingTask]);

	const handleSave = async () => {
		await saveTask({
			id: isNew ? undefined : (id as Id<"tasks">),
			name,
			description,
			period: Number(period),
			unit,
			tolerance: Number(tolerance),
		});
		router.push("/");
	};

	if (isLoading) {
		return <div className={common.loading}>Chargement...</div>;
	}

	return (
		<div className={styles.formWrapper}>
			<BackButton />
			<h1 className={styles.heading}>
				{isNew ? "Nouvelle tâche" : "Modifier la tâche"}
			</h1>

			<div className={styles.field}>
				<label className={styles.label}>Nom</label>
				<input
					className={styles.input}
					value={name}
					placeholder="Nom de la tâche"
					onChange={(e) => setName(e.target.value)}
				/>
			</div>

			<div className={styles.field}>
				<label className={styles.label}>Description</label>
				<textarea
					className={styles.textarea}
					value={description}
					placeholder="Description"
					onChange={(e) =>
						setDescription(e.target.value || undefined)
					}
				/>
			</div>
			<div className={styles.field}>
				<label className={styles.label}>Périodicité</label>
				<div className={styles.periodRow}>
					<input
						className={styles.input}
						type="number"
						min="1"
						value={period}
						onChange={(e) => setPeriod(e.target.value)}
						style={{ maxWidth: "6rem" }}
					/>
					<select
						className={styles.input}
						value={unit}
						onChange={(e) => setUnit(e.target.value as TimeUnit)}
					>
						{units.map((unit) => (
							<option key={unit} value={unit}>
								{unit}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className={styles.field}>
				<label className={styles.label}>Tolérance</label>
				<input
					className={styles.input}
					type="number"
					min="0"
					value={tolerance}
					onChange={(e) => setTolerance(e.target.value)}
				/>
			</div>

			<button className={styles.button} onClick={handleSave}>
				{isNew ? "Créer la tâche" : "Enregistrer"}
			</button>
		</div>
	);
}

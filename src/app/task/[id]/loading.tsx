// import { useParams } from "next/navigation";
import * as styles from "./styles.css";
import { AppWrapper } from "@/app/AppWrapper";

const LoadingPage = () => {
	// const { id } = useParams();

	const isNew = true; //id === "new";

	return (
		<AppWrapper
			title={isNew ? "Nouvelle tâche" : "Modifier la tâche"}
			withBackButton
			footer={
				<button className={styles.addTaskButton}>
					{isNew ? "Créer la tâche" : "Enregistrer"}
				</button>
			}
		>
			<div className={styles.formWrapper}>Chargement...</div>
		</AppWrapper>
	);
};

export default LoadingPage;

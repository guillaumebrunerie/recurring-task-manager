import { parseAsBoolean, useQueryState } from "nuqs";

export const useModal = () => {
	const [taskIdUrl, setTaskIdUrl] = useQueryState("task");
	const [isEditing, setIsEditing] = useQueryState(
		"edit",
		parseAsBoolean.withDefault(false),
	);
	const isNewTaskOpen = !taskIdUrl && isEditing;
	const closeModal = () => {
		void setTaskIdUrl(null, { history: "push" });
		void setIsEditing(false, { history: "push" });
	};
	const openNewTask = () => {
		void setTaskIdUrl(null, { history: "push" });
		void setIsEditing(true, { history: "push" });
	};
	return { isNewTaskOpen, closeModal, openNewTask };
};

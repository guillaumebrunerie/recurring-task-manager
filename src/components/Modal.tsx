import { ReactNode } from "react";
import * as styles from "./modal.css";

type ModalProps = {
	title: ReactNode;
	children: ReactNode;
	onClose: () => void;
};

export const Modal = ({ title, children, onClose }: ModalProps) => {
	return (
		<div className={styles.overlay} onClick={onClose}>
			<div className={styles.modalOverlay}>
				<div
					className={styles.modalContent}
					onClick={(e) => e.stopPropagation()}
				>
					<div className={styles.modalHeader}>
						{title}
						<button
							className={styles.closeButton}
							onClick={onClose}
							aria-label="Close"
						>
							✕
						</button>
					</div>
					{children}
				</div>
			</div>
		</div>
	);
};

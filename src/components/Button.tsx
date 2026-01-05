import * as styles from "./button.css";

type ButtonProps = { children?: React.ReactNode; onClick: () => void };

export const BlueButton = ({ children, onClick }: ButtonProps) => {
	return (
		<div className={styles.blueButton} onClick={onClick}>
			{children}
		</div>
	);
};

export const GreenButton = ({ children, onClick }: ButtonProps) => {
	return (
		<div className={styles.greenButton} onClick={onClick}>
			{children}
		</div>
	);
};

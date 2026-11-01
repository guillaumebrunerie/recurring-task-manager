import classNames from "classnames";

import * as styles from "./button.css";

type ButtonProps = {
	children?: React.ReactNode;
	onClick: () => void;
	className?: string;
};

export const BlueButton = ({ children, onClick, className }: ButtonProps) => {
	return (
		<div
			className={classNames(styles.blueButton, className)}
			onClick={onClick}
		>
			{children}
		</div>
	);
};

export const GreenButton = ({ children, onClick, className }: ButtonProps) => {
	return (
		<div
			className={classNames(styles.greenButton, className)}
			onClick={onClick}
		>
			{children}
		</div>
	);
};

export const LightGreenButton = ({
	children,
	onClick,
	className,
}: ButtonProps) => {
	return (
		<div
			className={classNames(styles.lightGreenButton, className)}
			onClick={onClick}
		>
			{children}
		</div>
	);
};

export const RedButton = ({ children, onClick, className }: ButtonProps) => {
	return (
		<div
			className={classNames(styles.redButton, className)}
			onClick={onClick}
		>
			{children}
		</div>
	);
};

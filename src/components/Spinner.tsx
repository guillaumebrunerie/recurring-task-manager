import * as styles from "./spinner.css";

type SpinnerProps = { scale?: number; noMarginRight?: boolean };

export const Spinner = ({ scale = 1, noMarginRight }: SpinnerProps) => {
	const marginRight = noMarginRight ? "0" : "0.5rem";
	return <span style={{ scale, marginRight }} className={styles.spinner} />;
};

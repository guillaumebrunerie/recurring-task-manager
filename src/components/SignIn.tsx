import { useAuthActions } from "@convex-dev/auth/react";
import * as styles from "./styles.css";
import Image from "next/image";

export function SignIn() {
	const { signIn } = useAuthActions();

	return (
		<div className={styles.signInWrapper}>
			<button
				className={styles.googleButton}
				onClick={() => void signIn("google")}
			>
				<Image
					src="/google-logo.svg"
					alt="Google logo"
					width={20}
					height={20}
					className={styles.googleLogo}
				/>
				Se connecter avec Google
			</button>
		</div>
	);
}

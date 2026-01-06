import { useAuthActions } from "@convex-dev/auth/react";
import Image from "next/image";

import * as styles from "./signIn.css";

export const SignIn = () => {
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
};

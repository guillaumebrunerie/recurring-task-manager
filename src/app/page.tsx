import { Suspense } from "react";

import { Spinner } from "@/components/Spinner";
import { getAllUsers, getCurrentUser, getTasks } from "@/server/data";

import { FooterClient } from "./Footer";
import { HeaderClient } from "./Header";
import { MainClient } from "./Main";
import * as styles from "./page.css";

const Page = () => {
	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<h1 className={styles.title}>Happy Home</h1>
				<Suspense>
					<Header />
				</Suspense>
			</header>
			<main className={styles.contents}>
				<div className={styles.taskPage}>
					<Suspense
						fallback={
							<div className={styles.loadingContainer}>
								<Spinner scale={2} noMarginRight />
							</div>
						}
					>
						<Main />
					</Suspense>
				</div>
			</main>
			<footer className={styles.footer}>
				<Suspense>
					<Footer />
				</Suspense>
			</footer>
		</div>
	);
};

const Header = async () => {
	const preloadedUser = await getCurrentUser();
	return <HeaderClient preloadedUser={preloadedUser} />;
};

const Main = async () => {
	const [preloadedTasks, preloadedUser, preloadedAllUsers] =
		await Promise.all([getTasks(), getCurrentUser(), getAllUsers()]);
	return (
		<MainClient
			preloadedTasks={preloadedTasks}
			preloadedUser={preloadedUser}
			preloadedAllUsers={preloadedAllUsers}
		/>
	);
};

const Footer = async () => {
	const preloadedUser = await getCurrentUser();
	return <FooterClient preloadedCurrentUser={preloadedUser} />;
};

export default Page;

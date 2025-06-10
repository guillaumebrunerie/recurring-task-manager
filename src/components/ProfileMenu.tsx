import { useState, useRef, useEffect } from "react";
import * as styles from "./profileMenu.css";

type ProfileMenuProps = {
	imageUrl?: string;
	onSignOut: () => void;
};

export const ProfileMenu = ({ imageUrl, onSignOut }: ProfileMenuProps) => {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className={styles.container} ref={containerRef}>
			<button
				className={styles.avatarButton}
				onClick={() => setOpen(!open)}
			>
				{imageUrl && (
					<img
						src={imageUrl}
						alt="Profile"
						className={styles.avatarImage}
					/>
				)}
			</button>
			{open && (
				<div className={styles.dropdown}>
					<div className={styles.dropdownItem} onClick={onSignOut}>
						Se déconnecter
					</div>
				</div>
			)}
		</div>
	);
};

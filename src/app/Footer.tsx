"use client";

import { usePreloadedQuery, type Preloaded } from "convex/react";
import { useRef, useState } from "react";

import type { api } from "@/convex/_generated/api";

import { BlueButton } from "@/components/Button";
import { useModal } from "@/hooks/useModal";
import { useSearch } from "@/hooks/useSearch";

import * as styles from "./footer.css";

type FooterClientProps = {
	preloadedCurrentUser: Preloaded<typeof api.users.getCurrentUserQuery>;
};

export const FooterClient = ({ preloadedCurrentUser }: FooterClientProps) => {
	const user = usePreloadedQuery(preloadedCurrentUser);
	if (!user) {
		return;
	}
	return (
		<>
			<SearchBar />
			<NewTaskButton />
		</>
	);
};

const SearchBar = () => {
	const [search, onSearchChange] = useSearch();

	const [isSearchOpen, setIsSearchOpen] = useState(!!search);
	const [isClosing, setIsClosing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const openSearch = () => {
		setIsSearchOpen(true);
		setIsClosing(false);
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	const handleBlur = () => {
		if (!search) {
			setIsClosing(true);
			setTimeout(() => {
				setIsSearchOpen(false);
				setIsClosing(false);
			}, 200);
		}
	};

	return isSearchOpen ?
			<input
				ref={inputRef}
				className={`${isClosing ? styles.searchInputClosing : styles.searchInput}${search ? ` ${styles.searchInputActive}` : ""}`}
				type="search"
				placeholder="Rechercher…"
				value={search ?? ""}
				onChange={(e) => onSearchChange(e.target.value)}
				onBlur={handleBlur}
			/>
		:	<button
				className={styles.searchButton}
				onClick={openSearch}
				aria-label="Rechercher"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="10" cy="10" r="7" />
					<line x1="15.24" y1="15.24" x2="21" y2="21" />
				</svg>
			</button>;
};

const NewTaskButton = () => {
	const { openNewTask } = useModal();

	return <BlueButton onClick={openNewTask}>Nouvelle tâche</BlueButton>;
};

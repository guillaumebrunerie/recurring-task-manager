import { useQueryState } from "nuqs";

export const useSearch = () => {
	const [search, setSearch] = useQueryState("search", {
		defaultValue: "",
		clearOnDefault: true,
	});
	const onSearchChange = async (value: string): Promise<void> => {
		await setSearch(value, { history: "replace" });
	};

	return [search, onSearchChange] as const;
};

import { useDataList } from "../useDataList";
import { debounce } from "lodash";
import { DocumentNode } from "graphql";

interface UseAutocompleteHook {
    options: any[];
    onInput(value: string): void;
}

interface Props {
    query: DocumentNode;
    search: string | (() => void);
}

export const useAutocomplete = (props: Partial<Props>): UseAutocompleteHook => {
    const useDataListProps = (props.query ? props : { query: props, search: undefined }) as Props;

    const dataList = useDataList({ useRouter: false, ...useDataListProps });

    return {
        options: dataList.data || [],
        onInput: debounce(query => {
            if (!query) {
                return;
            }

            let search = props.search || query;
            if (typeof search === "function") {
                search = search(query);
            }

            dataList.setSearch(search);
        }, 250)
    };
};

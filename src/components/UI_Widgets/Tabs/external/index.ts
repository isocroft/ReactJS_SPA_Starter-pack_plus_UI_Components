import { useSearchParamsState } from "react-busser";


export const useTabs = (activeTabIndexQuery= 'active_tab__react-busser', activeTabIndex = 0, replaceInHistory = false) => {
    const [, setSearchState] = useSearchParamsState(activeTabIndexQuery, replaceInHistory, String(activeTabIndex + 1));
    const activateTab = (tabIndex: number) => {
        setSearchState(String(tabIndex + 1))
    };

    return [activateTab];
};



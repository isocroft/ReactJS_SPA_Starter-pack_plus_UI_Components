import React, { FC, useState, useRef, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentPropsWithRef<T> & {
    as?: T;
  };

const isTabsHeaderOverflowing = (element: HTMLUListElement | HTMLMenuElement) => { 
  let currrenOverflowStyle = element.style.overflow || window.getComputedStyle(element).overflow; 
    
  if ( !currrenOverflowStyle || currrenOverflowStyle === "visible" ) {
    element.style.overflow = "hidden";
  }
                 
  let isOverflowing = element.clientWidth < element.scrollWidth; 
                 
  element.style.overflow = ""; 
                 
  return isOverflowing; 
};

const isActiveTabTitleInOverflow = (element: HTMLLIElement) => {
  const isCorrectOffsetParent = element.parentNode === element.offsetParent;
  if (!isCorrectOffsetParent) {
    return false;
  }

  return (element.offsetLeft + element.clientWidth) > element.offsetParent.clientWidth;
};

const useTabsCore = (initialActiveTabIndex: number, activeTabIdQuery: string, disableTabIdOnUrlQuery = false) => {
  const pageSearchParams = new window.URLSearchParams(window.location.search);
  const previousActiveTabIdQuery = useRef<string>(pageSearchParams.get(activeTabIdQuery) || String(initialActiveTabIndex + 1));

  const history = useHistory();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(() => {
    const activeTabIdFromUrlQuery = Number(previousActiveTabIdQuery.current);
    return activeTabFromUrlQuery - 1;
  });

  const handleSetActiveTab = useCallback<React.MouseEventHandler<HTMLElement>>((event: React.MouseEvent<HTMLElement>) => {
    const tabHeaderNode = event.currentTarget as Node;
    const targetNode = event.target as Node;
    const parentNode = targetNode.parentNode as HTMLElement;
    const clickedTabIndex = Number(tabHeaderNode.contains(targetNode) && (event.target as HTMLElement).hasAttribute('data-tab-title-index')
      ? (event.target as HTMLElement).dataset.tabTitleIndex
      : targetNode.parentNode && tabHeaderNode.contains(targetNode.parentNode) && parentNode.hasAttribute('data-tab-title-index') 
        ? parentNode.dataset.tabTitleIndex
        : parentNode?.parentNode && tabHeaderNode.contains(parentNode.parentNode) && (parentNode?.parentNode as HTMLElement).hasAttribute('data-tab-title-index')
          ? (parentNode?.parentNode as HTMLElement).dataset.tabTitleIndex
          : '-1'
      );

      if (clickedTabIndex !== NaN
        && clickedTabIndex !== -1) {
        setActiveTabIndex((prevTabIndex) => {
          if (prevTabIndex === clickedTabIndex) {
            return prevTabIndex;
          }
          return clickedTabIndex;
        });
      }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);


  useEffect(() => {
    if (disableTabIdOnUrlQuery) {
      return;
    }
    
    const onTabIdQueryChange = ($location) => {
      const currentPageSearchParams = new window.URLSearchParams($location.search);
      const currentTabfromUrlQuery = Number(currentPageSearchParams.get(activeTabIdQuery));

      if (currentTabfromUrlQuery !== NaN
        && previousActiveTabIdQuery.current !== String(currentTabfromUrlQuery)) {
        previousActiveTabIdQuery.current = String(currentTabfromUrlQuery)
        setActiveTabIndex((prevTabIndex) => {
          if (prevTabIndex === currentTabfromUrlQuery) {
            return prevTabIndex;
          }
          return currentTabfromUrlQuery;
        });
      }
    };
    
    const unlisten = history.listen((location) => {
      return onTabIdQueryChange(location)
    })

    return () => {
      unlisten();
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [history, activeTabIdQuery]);
  
  return [activeTabIndex, handleSetActiveTab] as const;
};

const renderChildren = (
  children: React.ReactNode,
  props: { activeTab: number, onClick: React.MouseEventHandler<HTMLElement> }
) => {
  const oneChild = hasChildren(children, 1);
  const noChild = hasChildren(children, 0);

  if (oneChild || noChild) {
    return null;
  }

  return React.Children.map(children, (child) => {
    switch (true) {
      case isSubChild(child, "TabsHeader"):
        if (!React.isValidElement<React.ReactNode & TabsHeaderProps>(child)) {
          return null;
        }

        return React.cloneElement(child, {
          activeTabTitleIndex: props.activeTab,
          onClick: props.onClick
        });
      case isSubChild(child, "TabsBody"):
        if (!React.isValidElement<React.ReactNode & TabsBodyProps>(child)) {
          return null;
        }

        return React.cloneElement(child, {
          activeTabPanelIndex: props.activeTab
        });
      default:
        return null;
    }
  });
};

interface TabsProps extends React.ComponentPropsWithRef<"section"> {
  activeTabIndex?: number;
  activeTabIdQuery?: string;
  disableTabIdOnUrlQuery?: boolean;
}

const Tabs = ({ activeTabIndex = 0, activeTabIdQuery = 'active_tab__react-busser', className, disableTabIdOnUrlQuery = false, children, ...props }: TabsProps) => {
  const [activeTab, onClick] = useTabsCore(activeTabIndex, activeTabIdQuery, disableTabIdOnUrlQuery);

  useEffect(() => {  
    const styleSheetsOnly = [].slice.call<StyleSheetList, [], StyleSheet[]>(
      window.document.styleSheets
    ).filter(
      (sheet) => {
        if (sheet.ownerNode) {
          return sheet.ownerNode.nodeName === "STYLE";
        }
        return false;
    }).map(
      (sheet) => {
        if (sheet.ownerNode
          && sheet.ownerNode instanceof Element) {
          return sheet.ownerNode.id;
        }
        return "";
    }).filter(
      (id) => id !== ""
    );

    if (styleSheetsOnly.length > 0
      && styleSheetsOnly.includes("react-busser-headless-ui_tabs")) {
      return;
    }

    const tabsStyle = window.document.createElement('style');
    tabsStyle.id = "react-busser-headless-ui_tabs";

    tabsStyle.innerHTML = `  
      .tabs_body-box {
        width: 100%;
        min-height: 1;
      }

      .tabs_header-box {
        min-height: 1;
        width: 100%;
        max-width: 100%;
      }

      .tabs_header-inner-box {
        overflow-x: auto;
        position: relative; /* @HINT: Needed to correctly calculate 'offsetParent' for tab titles */
      }
    `;  
    window.document.head.appendChild(tabsStyle);  
  
    return () => {  
      window.document.head.removeChild(tabsStyle);  
    };  
  }, []);
  
  return (
    <section className={className} {...props} role="tabs">
      {renderChildren(children, {
        onClick,
        activeTab
      })}
    </section>
  );
};

interface TabTitleProps extends React.ComponentPropsWithRef<"li"> {
  isActive?: boolean
}

const TabTitle: FC<TabTitleProps> = ({ children, className, isActive, ...props }) => {
  return (<li className={className} {...props} role="tab" aria-selected={isActive ? "true" : "false"} tabIndex={isActive ? "0" : "-1"}>
    {children}
  </li>);
};

type TabsHeaderProps = CustomElementTagProps<"menu" | "ul"> & {
  activeTabTitleIndex?: number;
  wrapperClassName?: string;
};

const TabsHeader: FC<TabsHeaderProps> = ({  as: Component = "ul", className, wrapperClassName, activeTabTitleIndex, children, ...props }) => {
  const tabTitleElement = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!tabTitleElement.current) {
      return;
    }
    if (isTabsHeaderOverflowing(
      tabTitleElement.current
    )) {
      const activeTabElement = tabTitleElement.current.querySelector(
        `[data-tab-title-index="${activeTabTitleIndex}"]`
      );

      if (!activeTabElement) {
        return;
      }
      if (isActiveTabTitleInOverflow(
        activeTabElement
      ) {
        /* @HINT: Make sure that no active tab is hidden within a CSS overflow */
        tabTitleElement.current.scrollBy(5000, 0);
      }
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [activeTabTitleIndex]);

  return (<div className={`tabs_header-box ${wrapperClassName}`} role="group">
    <Component className={`tabs_header-inner-box ${className}`} {...props} role="tablist" ref={tabTitleElement}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement<TabTitleProps>(child) || !isSubChild(child, "TabTitle")) {
          return null;
        }

        return React.cloneElement(child, {
          isActive: activeTabTitleIndex === index,
          "data-tab-title-index": index
        });
      })}
    </Component>
  </div>)
};

type TabPanelProps = React.ComponentPropsWithRef<"div">;

const TabPanel: FC<TabPanelProps> = ({ children, className, ...props }) => {
  return <div className={className} {...props} role="tabpanel" tabIndex="0">
    {children}
  </div>
};
  
interface TabsBodyProps extends React.ComponentPropsWithRef<"section"> {
  activeTabPanelIndex: number;
}
  
const TabsBody: FC<TabsBodyProps> = ({ children, className, activeTabPanelIndex, ...props }) => {
  const activeTabPanel = React.Children.toArray(children)[activeTabPanelIndex];

  return (<section className={`tabs_body-box ${className}`} role="group" {...props}>
    {isSubChild(activeTabPanel, "TabPanel") ? activeTabPanel : null}
  </section>);
};

Tabs.TabsHeader = TabsHeader;
Tabs.TabTitle = TabTitle;
Tabs.TabsBody = TabsBody;
Tabs.TabPanel = TabPanel;

// import { useIsFirstRender } from "react-busser";

// const isFirstRender = useIsFirstRender();
// const [activate] = useTabs("group_settings_tab", 1);

// useEffect(() => {
//   if (isFirstRender) {
//     /* programmatically reset to the active tab to the first tab */
//     activate(0);
//   }
// }, []);

// <Tabs activeTabIndex={1} activeTabIdQuery={"group_settings_tab"}>
//   <TabsHeader>
//     <TabTitle>General</TabTitle>
//   </TabsHeader>
//   <TabsBody>
//     <TabPanel>
//       <h4>General Settings</h4>
//       <p>All settings for user app</p>
//     </TabPanel>
//   </TabsBody>
// </Tabs>

export type { TabsProps, TabsHeaderProps, TabTitleProps, TabsBodyProps, TabPanelProps };

export default Tabs;

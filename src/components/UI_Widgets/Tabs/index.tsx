import React, { FC, useState, useCallback } from "react";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentPropsWithRef<T> & {
    as?: T;
  };

const useTabsCore = (initialActiveTabIndex: number, activeTabIndexQuery: string) => {
    const pageParamsQuery = new URLSearchParams(window.location.search);
    const activeTabfromUrlQuery = Number(pageParamsQuery.get(activeTabIndexQuery) || initialActiveTabIndex + 1);

    const [activeTabIndex, setActiveTabIndex] = useState(() => activeTabfromUrlQuery - 1);

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

        if (clickedTabIndex !== -1) {
          setActiveTabIndex(clickedTabIndex);
        }
    }, [setActiveTabIndex]);

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
        if (!React.isValidElement<React.ReactNode & { activeTabTitleIndex: number }>(child)) {
          return null;
        }

        return React.cloneElement(child, {
          activeTabTitleIndex: props.activeTab,
          onClick: props.onClick
        });
        break;
      case isSubChild(child, "TabsBody"):
        if (!React.isValidElement<React.ReactNode & { activeTabPanelIndex: number }>(child)) {
          return null;
        }

        return React.cloneElement(child, {
          activeTabPanelIndex: props.activeTab
        });
        break;
      default:
        return null;
        break;
    }
  });
};

interface TabsProps extends React.ComponentPropsWithRef<"section"> {
  activeTabIndex?: number;
  activeTabIndexQuery?: string;
}

const Tabs: FC<TabsProps> = ({ activeTabIndex = 0, activeTabIndexQuery = 'active_tab__react-busser', className, children, ...props }) => {
  const [activeTab, onClick] = useTabsCore(activeTabIndex, activeTabIndexQuery);

  React.useEffect(() => {  
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

    if (styleSheetsOnly.length === 0
      || styleSheetsOnly.includes("react-busser-headless-ui_tabs")) {
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

interface TabsHeaderProps extends CustomElementTagProps<"menu" | "ul"> {
  activeTabTitleIndex?: number;
  wrapperClassName?: string;
};

const TabsHeader: FC<TabsHeaderProps> = ({  as: Component = "ul", className, wrapperClassName, activeTabTitleIndex, children, ...props }) => {
  return (<div className={`tabs_header-box ${wrapperClassName}`} role="group">
    <Component className={`tabs_header-inner-box ${className}`} {...props} role="tablist">
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
}

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

import React from "react";
import { Link } from "react-router-dom";
import type { Location } from "history";

import { twMerge } from "tailwind-merge";

export const composeClassesModule = (...styles: unknown[]): string => {
  return Array.from(new Set(styles.filter((item) => item).join(' ')));
}

export const composeClassTailwind = (...styles: unknown[]): string => {
  return twMerge(...styles);
}

export const hasChildren = (children: React.ReactNode, count: number) => {
  if (!Boolean(children)) {
    return false;
  }
  const childCount = React.Children.count(children);
  return childCount === count;
};

export const removeFromChildren = (
  children: React.ReactNode | React.ReactNode[],
  types: any[]
): React.ReactNode[] => {
  return React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && !types.includes(child.type)
  );
};

function retrieveChildComponent<A = any, T extends (...args: A[]) => React.JSX.Element>(
  children: React.ReactNode | React.ReactNode[],
  type: T,
  { mode = "module", propsOverride = { } }: { mode: "utility" | "module", propsOverride?: Partial<Parameters<T>[0]> }
) {
  const childrenArr = React.Children.toArray(children);
  let child = childrenArr.find(
    (child) => React.isValidElement(child) && child.type === type
  ) as React.ReactElement<
    Parameters<T>[0],
    string | React.JSXElementConstructor<A>
  >;

  if (child && propsOverride) {
    const { className, ...rest } = child.props;
    child = React.cloneElement(child, {
      className: mode === "module"
        ? composeClassesModule(className, propsOverride?.className || "")
        : composeClassesTailwind(className, propsOverride?.className || ""),
      ...rest,
    });
  }

  return child;
}

export function retrieveChildComponents<A = any, T extends (...args: A[]) => React.JSX.Element>(
  children: React.ReactNode | React.ReactNode[],
  type: T,
  { mode = "module", propsOverride = { } }: { mode: "utility" | "module", propsOverride?: Partial<Parameters<T>[0]> }
) {
  
  const childrenArr = React.Children.toArray(children);
  const child = (
    childrenArr.filter(
      (child) => React.isValidElement(child) && child.type === type
    ) as React.ReactElement<
      Parameters<T>[0],
      string | React.JSXElementConstructor<A>
    >[]
  ).map((child) => {
    if (child && propsOverride) {
      const { className, ...rest } = child.props;
      child = React.cloneElement(child, {
        className: mode === "module"
          ? composeClassesModule(className, propsOverride?.className || "")
          : composeClassesTailwind(className, propsOverride?.className || ""),
        ...rest,
      });
    }
    return child;
  });

  return child;
}

export const isSubChild = <C extends React.ReactNode>(
  child: React.ReactNode,
  tag: string
): child is C =>
  React.isValidElement(child) && (typeof(child?.type) === "function" ? child?.type?.name === tag : String(child?.type).includes(tag));

export const renderBreadcrumbs = (
  breadcrumbs: Location[],
  breadcrumbsMap = {},
  className = "breadcrumbList",
  breadcrumbArrowNode = <span>{">"}</span>
) => {
  const count = breadcrumbs.length;
  return (
    <>
      <h6>Breadcrumbs</h6>
      <ul
        style={{
          listStyle: "none",
          display: "flex",
        }}
        className={className}
      >
        {breadcrumbs.map((breadcrumb, index) => {
          return (
            <div
              key={String(
                (breadcrumb.key === "default" ? "" : breadcrumb.key || "") +
                  "index_" +
                  breadcrumb.pathname +
                  index
              )}
            >
              <li
                style={{
                  display: "inline-block",
                  marginRight: "5px",
                  marginLeft: "5px",
                }}
              >
                <Link key={String(index)} to={breadcrumb.pathname}>
                  {breadcrumbsMap[breadcrumb.pathname]}
                </Link>
              </li>
              {index === count - 1 ? null : breadcrumbArrowNode}
            </div>
          );
        })}
      </ul>
    </>
  );
};

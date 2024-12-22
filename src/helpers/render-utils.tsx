import React from "react";
import { Link } from "react-router-dom";
import type { Location } from "history";

export const hasChildren = (children: React.ReactNode, count: number) => {
  if (!Boolean(children)) {
    return false;
  }
  const childCount = React.Children.count(children);
  return childCount === count;
};

export const isSubChild = <C extends React.ReactNode>(
  child: React.ReactNode,
  tag: string
): child is C =>
  React.isValidElement(child) && (typeof(child?.type) === "function" ? child?.type?.name === tag : String(child?.type).includes(tag));

export const renderBreadcrumbs = (
  breadcrumbs: Location[] = [],
  className = "breadcrumbList",
  breadcrumbArrowNode = <span>{">"}</span>,
  breadcrumbsMap = {}
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

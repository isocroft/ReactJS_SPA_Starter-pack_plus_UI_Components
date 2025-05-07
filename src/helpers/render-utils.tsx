import React from "react";
import { Link } from "react-router-dom";
import type { Location } from "history";

import { twMerge } from "tailwind-merge";

/**
 * composeClassesModule:
 *
 * @param {Array.<*>} styles
 *
 * @returns {String}
 */
export const composeClassesModule = (...styles: unknown[]): string => {
  return Array.from(new Set(styles.filter((item) => item).join(' ')));
};

/* @EXAMPLE: composeClassesModule("form-date-picker", "sr-inert-only", "panel-wrapper") */

/**
 * composeClassTailwind:
 *
 * @param {Array.<*>} styles
 *
 * @returns {String}
 */
export const composeClassTailwind = (...styles: unknown[]): string => {
  return twMerge(...styles);
};

/* @EXAMPLE: composeClassTailwind("cursor-pointer absolute m-[23px]", "inset-0") */

/**
 * htmlEncode:
 *
 *
 * @param {String} rawText
 *
 * @returns {String}
 *
 */
export const htmlEncode = (rawText: string): string => {
  return (rawText || "").replace(/[\u00A0-\u9999<>&]/gim, function (mark: string) {
    return '&#' + mark.charCodeAt(0) + ';'
  })
};

/*!
 * @EXAMPLE: 
 *
 * const encodedHTML = htmlEncode('<h1><img onerror="javascript:return null" /></h1>');
 *
 * console.log(encodedHTML); // ""
 *
 */

/**
 * htmlDecode:
 *
 *
 * @param {String} encodedText
 *
 * @returns {String | Null}
 *
 */
export const htmlDecode = (encodedText: string): string | null => {
  const doc = new window.DOMParser().parseFromString(encodedText || "&nbsp;", 'text/html')
  const docElem = doc.documentElement as Node
 
  return docElem.textContent
};

/*!
 * @EXAMPLE: 
 *
 * const decodedHTML = htmlDecode("&lt;h1&gt;Hi there!&lt;/h1&gt;");
 *
 * console.log(decodedHTML); // "<h1>Hi there!</h1>"
 *
 */

/**
 * formatHTMLEntity:
 *
 *
 * @param {String} textValue
 * @param {String} entityHexValue
 * @param {String} prefix
 *
 * @returns {String}
 *
 */
export const formatHTMLEntity = (
  textValue: string,
  entityHexVal: string,
  prefix: string = ''
): string => {
  const isNumeric = /^\d{2,5}$/.test(entityHexValue)
  const number = parseInt(isNumeric ? "8" : entityHexValue, 16)
 
  return (
    (textValue ? textValue + ' ' : '') +
    prefix + String.fromCharCode(number)
  )
};

/* @EXAMPLE: <p className="wrapper">{formatHTMLEntity('View Full Project', '279D')}</p> */

/**
 * hasChildren:
 *
 * @param {React.ReactNode} children
 * @param {Number} count
 *
 *
 * @returns {Boolean}
 */
export const hasChildren = (children: React.ReactNode | React.ReactNode[], count: number): boolean => {
  if (!Boolean(children) && count === 0) {
    return true;
  }
  const childCount = React.Children.count(children);
  return childCount === count;
};

/*!
 * @EXAMPLE:
 *
 * const zeroChildren = hasChildren(children, 0);
 *
 * console.log(zeroChildren); // false
 *
 */

/**
 * removeFromChildren:
 *
 * @param {React.ReactNode} children
 * @param {Array.<*>} types
 *
 *
 * @returns {Array.<React.ReactNode>}
 */
export const removeFromChildren = (
  children: React.ReactNode | React.ReactNode[],
  types: any[]
): React.ReactNode[] => {
  return React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && !types.includes(child.type)
  );
};

/*!
 * @EXAMPLE:
 *
 * const modifiedChildren = removeFromChildren(children, Button);
 *
 * console.log(modifiedChildren); // {}
 *
 */

/**
 * retrieveChildComponent:
 *
 */
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

/**
 * retrieveChildComponennts:
 *
 */
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

/**
 * isSubChild:
 *
 */
export const isSubChild = <C extends React.ReactNode>(
  child: C,
  tag: string
): child is C => {
  const getChildTypeName = (
    $child: React.ReactElement<C, string | React.JSXElementConstructor<string>>
  ) => {
    if (typeof $child !== "object" || $child === null) {
      return "";
    }
    /* @ts-ignore */
    return "render" in $child?.type
      ? $child?.type?.render?.name
      : $child?.type;
  };

  return (
    React.isValidElement<C>(child) &&
    (typeof child?.type === "function"
      ? child?.type?.name === tag
      : String(getChildTypeName(child)).includes(tag))
  );
};

/**
 * renderBreadcrumbs:
 *
 */
export const renderBreadcrumbs = ({
  breadcrumbs = [],
  breadcrumbsMap = {},
  className = "breadcrumbList",
  currentLocation: {},
  breadcrumbArrowNode = <span>{">"}</span>
}: {
  breadcrumbs: Location[],
  breadcrumbsMap: Record<string, string>,
  className: string,
  currentLocation: Location,
  breadcrumbArrowNode: React.ReactElement
}) => {
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
                <Link key={String(index)} to={breadcrumb.pathname} isActive={breadcrumb.pathname === currentLocation.pathname}>
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

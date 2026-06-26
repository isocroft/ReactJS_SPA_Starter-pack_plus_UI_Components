import React from "react";
import { NavLink } from "react-router-dom";
import type { Location } from "history";

import { ClassNameValue, twMerge } from "tailwind-merge";

/**
 * composeClassesModule:
 *
 * @param {Array.<*>} styles
 *
 * @returns {String}
 */
export const composeClassesModule = (...styles: ClassNameValue[]): string => {
  return Array.from(new Set(styles.filter((item) => item).join(" "))).join(" ");
};

/* @EXAMPLE: composeClassesModule("form-date-picker", "sr-inert-only", "panel-wrapper") */

/**
 * composeClassTailwind:
 *
 * @param {Array.<*>} styles
 *
 * @returns {String}
 */
export const composeClassesTailwind = (...styles: ClassNameValue[]): string => {
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
  if (typeof rawText !== "string") {
    throw new TypeError(
	  `htmlEncode("${rawText}"): argument 1 is not a string`
	);
  }

  return (rawText || "").replace(
    /[\u00A0-\u9999<>&]/gim,
    function (mark: string) {
      return "&#" + mark.charCodeAt(0) + ";";
    }
  );
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
  if (typeof encodedText !== "string") {
    throw new TypeError(
	  `htmlDecode("${encodedText}"): argument 1 is not a string`
	);
  }

  const doc = new window.DOMParser().parseFromString(
    encodedText || "&nbsp;",
    "text/html"
  );
  const docElem = doc.documentElement as Node;

  return docElem.textContent;
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
  entityHexValue: string,
  prefix: string = ""
): string => {
  if (typeof textValue !== "string") {
	throw new TypeError(
	  `formatHTMLEntity("${textValue}", "${entityHexValue}", "${prefix}"): argument 1 is not a string`
	);
  }

  if (typeof entityHexValue !== "string") {
	throw new TypeError(
	  `formatHTMLEntity("${textValue}", "${entityHexValue}", "${prefix}"): argument 2 is not a string`
	);
  }

  if (typeof prefix !== "string") {
	throw new TypeError(
	  `formatHTMLEntity("${textValue}", "${entityHexValue}", "${prefix}"): argument 3 is not a string`
	);
  }

  const isNumeric = /^\d{2,5}$/.test(entityHexValue);
  const number = parseInt(isNumeric ? "8" : entityHexValue, 16);

  return (
    (textValue ? textValue + " " : "") + prefix + String.fromCharCode(number)
  );
};

/* @EXAMPLE: <p className="wrapper">{formatHTMLEntity('View Full Project', '279D')}</p> */

/**
 * verifyDOMElementIsWithinViewPort:
 *
 * @param {HTMLElement} element
 *
 * @returns {Boolean}
 */
export const verifyDOMElementIsWhollyWithinViewport = (element: HTMLElement) => {
  if (!Boolean(element) || !(element instanceof window.HTMLElement)) {
	throw new TypeError(
	  `verifyDOMElementIsWhollyWithinViewport(${element}): argument 1 is not a DOM element`
	);
  }

  const rect = element.getBoundingClientRect();

  const minimumYFrame = 0;
  const minimumXFrame = 0;
  const maximumYFrame = (window.innerHeight || document.documentElement.clientHeight);
  const maximumXFrame = (window.innerWidth || document.documentElement.clientWidth);

  return (
    rect.top >= minimumYFrame &&  
    rect.left >= minimumXFrame &&  
    rect.bottom <= maximumYFrame &&  
    rect.right <= maximumXFrame
  );
};

/*!
 * @EXAMPLE:
 * 
 * const isElementVisibleInViewport = verifyDOMElementIsWhollyWithinViewport(
 *   document.querySelector('[id="compactor"]')
 * )
 *
 * console.log(sElementVisibleInViewport) // true
 */

/**
 * verifyDOMElementIsNotWithinViewPort:
 *
 * @param {HTMLElement} element
 *
 * @returns {Boolean}
 */
export const verifyDOMElementIsNotWithinViewport = (element: HTMLElement) => {
  if (!Boolean(element) || !(element instanceof window.HTMLElement)) {
	throw new TypeError(
	  `verifyDOMElementIsNotWithinViewport(${element}): argument 1 is not a DOM element`
	);
  }
	
  const rect = element.getBoundingClientRect();

  const minimumYFrame = 0;
  const minimumXFrame = 0;
  const maximumYFrame = (window.innerHeight || document.documentElement.clientHeight);
  const maximumXFrame = (window.innerWidth || document.documentElement.clientWidth);
	
  return (
    (rect.top < minimumYFrame &&
      rect.bottom < minimumYFrame) ||
    (rect.left < minimumXFrame &&
      rect.right < minimumXFrame) ||
    rect.y > maximumYFrame ||
    rect.x > maximumXFrame
  );
};

/*!
 * @EXAMPLE:
 * 
 * const isElementNotVisibleInViewport = verifyDOMElementIsNotWithinViewport(
 *   document.querySelector('[id="compactor"]')
 * )
 *
 * console.log(isElementNotVisibleInViewport) // false
 */

/**
 * verifyDOMElementIsPartiallyWithinViewPort:
 *
 * @param {HTMLElement} element
 *
 * @returns {Boolean}
 */
export const verifyDOMElementIsPartiallyWithinViewPort = (element: HTMLElement) => {  
  return !(
    verifyDOMElementIsWhollyWithinViewport(element)
  ) && !(
    verifyDOMElementIsNotWithinViewport(element)
  );  
};

/*!
 * @EXAMPLE:
 * 
 * const isElementPartialyVisibleInViewport = verifyDOMElementIsPartiallyWithinViewPort(
 *   document.querySelector('[id="compactor"]')
 * )
 *
 * console.log(isElementPartialyVisibleInViewport) // true
 */

/**
 * verifyDOMElementIsWhollyOrPartiallyWithinViewPort:
 *
 * @param {HTMLElement} element
 *
 * @returns {Boolean}
 */
export const verifyDOMElementIsWhollyOrPartiallyWithinViewPort = (element: HTMLElement) => {  
  return (
    verifyDOMElementIsWhollyWithinViewport(element)
  ) && !(
    verifyDOMElementIsNotWithinViewport(element)
  );  
};

/*!
 * @EXAMPLE:
 * 
 * const isElementPartialyOrWhollyVisibleInViewport = verifyDOMElementIsWhollyOrPartiallyWithinViewPort(
 *   document.querySelector('[id="compactor"]')
 * )
 *
 * console.log(isElementPartialyOrWhollyVisibleInViewport) // true
 */

/**
 * hasChildren:
 *
 * @param {React.ReactNode} children
 * @param {Number} count
 *
 * @returns {Boolean}
 */
export const hasChildren = (
  children: React.ReactNode | React.ReactNode[],
  count: number
): boolean => {
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
 * @param {React.ReactNode | Array<React.ReactNode>} children
 * @param {(...args: any[]) => JSX.Element} type
 * @param {Object} options
 *
 * @returns {React.ReactNode}
 */
function retrieveChildComponent<
  A extends keyof React.JSX.IntrinsicElements,
  T extends (...args: A[]) => React.JSX.Element
>(
  children: React.ReactNode | React.ReactNode[],
  type: T,
  {
    mode = "module",
    propsOverride = {},
  }: {
    mode: "utility" | "module";
    propsOverride?: Partial<React.ComponentPropsWithRef<Parameters<T>[0]>>;
  }
) {
  const childrenArr = React.Children.toArray(children);
  let child = childrenArr.find(
    (child) =>
      React.isValidElement<React.ComponentPropsWithRef<A>>(child) &&
      child.type === type
  ) as React.ReactElement<
    React.ComponentPropsWithRef<A>,
    string | React.JSXElementConstructor<A>
  >;

  if (child && propsOverride) {
    const { className, ...rest } = child.props;
    const newClassName =
      mode === "module"
        ? composeClassesModule(className, propsOverride?.className || "")
        : composeClassesTailwind(className, propsOverride?.className || "");

    child = React.cloneElement(child, {
      className: newClassName,
      ...rest,
    } as React.ComponentPropsWithRef<A>);
  }

  return child;
}

/*!
 * @EXAMPLE:
 *
 *
 *
 */

/**
 * retrieveChildComponents:
 *
 * @param {React.ReactNode | Array<React.ReactNode>} children
 * @param {(...args: any[]) => JSX.Element} type
 * @param {Object} options
 *
 * @returns {React.ReactNode | Array<React.ReactNode>}
 */
export function retrieveChildComponents<
  A extends keyof React.JSX.IntrinsicElements,
  T extends (...args: A[]) => React.JSX.Element
>(
  children: React.ReactNode | React.ReactNode[],
  type: T,
  {
    mode = "module",
    propsOverride = {},
  }: {
    mode: "utility" | "module";
    propsOverride?: Partial<React.ComponentPropsWithRef<Parameters<T>[0]>>;
  }
) {
  const childrenArr = React.Children.toArray(children);
  const child = (
    childrenArr.filter(
      (child) =>
        React.isValidElement<React.ComponentPropsWithRef<A>>(child) &&
        child.type === type
    ) as React.ReactElement<
      React.ComponentPropsWithRef<A>,
      string | React.JSXElementConstructor<A>
    >[]
  ).map((child) => {
    if (child && propsOverride) {
      const { className, ...rest } = child.props;
      const newClassName =
        mode === "module"
          ? composeClassesModule(className, propsOverride?.className || "")
          : composeClassesTailwind(className, propsOverride?.className || "");

      child = React.cloneElement(child, {
        className: newClassName,
        ...rest,
      } as React.ComponentPropsWithRef<A>);
    }
    return child;
  });

  return child;
}

/*!
 * @EXAMPLE:
 *
 *
 *
 */

/**
 * isSubChild:
 *
 * @param {React.ReactNode} child
 * @param {String} tag
 *
 * @returns {Boolean}
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
    return "render" in $child?.type ? $child?.type?.render?.name : $child?.type;
  };

  return (
    React.isValidElement<C>(child) &&
    (typeof child?.type === "function"
      ? child?.type?.name === tag
      : String(getChildTypeName(child)).includes(tag))
  );
};

/*!
 * @EXAMPLE:
 *
 *
 * const isHeading = isSubChild(props.children, "Heading");
 *
 * console.log(isHeading); // true
 *
 */

/**
 * renderBreadcrumbs:
 *
 * @param {Object} breadcrumbOptions
 *
 * @returns {JSX.Element}
 */
export const renderBreadcrumbs = ({
  breadcrumbs = [],
  breadcrumbsMap = {},
  className = "breadcrumbList",
  currentLocation = null,
  breadcrumbArrowNode = <span>{">"}</span>,
}: {
  breadcrumbs: Location[];
  breadcrumbsMap: Record<string, string>;
  className: string;
  currentLocation: Location | null;
  breadcrumbArrowNode: React.ReactElement;
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
                <NavLink
                  key={String(index)}
                  to={breadcrumb.pathname}
                  isActive={(match, location) => {
                    if (!match) return false;
                    if (currentLocation) {
                      return breadcrumb.pathname === currentLocation.pathname;
                    }
                    return breadcrumb.pathname === location.pathname;
                    // Example: Only active if a specific query param exists
                    // const searchParams = new URLSearchParams(location.search);
                    // return searchParams.get("view") === "detailed";
                  }}
                >
                  {breadcrumbsMap[breadcrumb.pathname]}
                </NavLink>
              </li>
              {index === count - 1 ? null : breadcrumbArrowNode}
            </div>
          );
        })}
      </ul>
    </>
  );
};

/*!
 * @EXAMPLE:
 *
 *
 */

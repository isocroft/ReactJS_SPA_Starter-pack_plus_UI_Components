import React from "react";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";

const AccordionTrigger = ({ children, ...props }: React.ComponentProps<"summary">) => {
  return (
    <summary {...props}>
      {children}
    </summary>
  )
};

const AccordionContent = ({ children, ...props }: React.ComponentProps<"section">) => {
  return (
    <section {...props}>
      {children}
    </section>
  );
};

const Accordion = () => {
  
  const renderChildren = ($children: React.ReactNode) => {
    const childrenProps = React.Children.map($children, (child) => {
      switch (true) {
        case React.isValidElement(child) && isSubChild(child, "AccordionContent"):
          return React.cloneElement(
            child as React.ReactElement<React.ComponentProps<"section">>,
            {
              ref: (node) => {
                if (typeof $ref === "function") {
                  $ref(node);
                }
                /* @HINT: Call the original ref on the child, if any */
                /* @CHECK: https://github.com/facebook/react/issues/8873#issuecomment-489579878 */
                const { ref } = child;
                if (typeof ref === "function") {
                  ref(node);
                } else if (ref !== null) {
                  ref.current = node;
                }
              },
              disabled
            }
          );
          break;
        default:
          return child;
          break;
      }
    });
    return childrenProps;
  };

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
      /* @ts-ignore */
      && styleSheetsOnly.includes("react-busser-headless-ui_accordion")) {
      return;
    }

    const faccordionStyle = window.document.createElement('style');
    accordionStyle.id = "react-busser-headless-ui_accordion";

    accordionStyle.innerHTML = `
      details > summary {
        list-style: none; /* Hides the default arrow */
      }

      /* Removes the default arrow on Chrome */
      details > summary::-webkit-details-marker {
        display: none;
      }
    `;  
    window.document.head.appendChild(accordionStyle);  
  
    return () => {  
      window.document.head.removeChild(accordionStyle);  
    };
  }, []);

  return (
    <details>
      {hasChildren(children, 0) ? null : renderChildren(children)}
    </details>
  );
};

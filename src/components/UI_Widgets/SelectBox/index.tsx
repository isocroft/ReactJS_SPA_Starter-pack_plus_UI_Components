import React, { FC, Ref, useEffect } from "react";

import { hasChildren } from "../../../helpers/render-utils";

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentProps<T> & {
    as?: T;
    children: undefined;
  };
/*
type Fn<ARGS extends any[], R> = (...args: ARGS) => R;

const useEventCallback = <A extends any[], R>(fn: Fn<A, R>): Fn<A, R> => {
  const ref = React.useRef<Fn<A, R>>(fn);

  // not sure this I like assigning to a ref during the method call, but React recommends it for certain circumstances:
  // https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents
  // so it's probably OK.
  
  if (ref.current !== fn) {
    ref.current = fn;
  }
  

  const immutableRef = useRef((...args: A) => {
    // perform call on version of the callback from last commited render
    return ref.current(...args);
  }).current;

  return immutableRef;

};

function useEventCallback<A extends any[], R>(fn: Fn<A, R>): Fn<A, R> {
  const ref = React.useRef(fn);
  const _effect = typeof React.useLayoutEffect === "function" ? React.useLayoutEffect : React.useEffect;

  _effect(() => {
    ref.current = fn;
  }, [fn]);

  return React.useCallback(() => {
    const fn = ref.current;
    return fn();
  }, [ref]);
}
*/

const SelectBox: FC<
  {
    placeholder?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    children?: React.ReactNode;
    chevronIconSize?: number;
    chevronIconFillColor?: string;
  } &
   CustomElementTagProps<"select">
  > = React.forwardRef(({
  children,
  wrapperClassName,
  labelClassName,
  className,
  as: Component = "select",
  chevronIconSize,
  chevronIconFillColor,
  ...props
}, ref: Ref<HTMLSelectElement>) => {
  /*
  const onClick = useEventCallback<NonNullable<ComponentProps<"select">["onClick"]>>((event) => {
    if (typeof props.onClick === "function") {
      props.onClick(e);
    }

    if (e.defaultPrevented) {
      return;
    }

    // @TODO: Do something later...
  })
  */

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
      && styleSheetsOnly.includes("react-busser-headless-ui_select")) {
      return;
    }

    const selectStyle = window.document.createElement('style');
    selectStyle.id = "react-busser-headless-ui_select";

    selectStyle.innerHTML = `
      .select_wrapper-box {
        position: relative;
        min-height: auto;
        font-size: 0;
      }

      .select_masked {
        width: 100%;
        box-sizing: border-box;
        -webkit-appearance: none;
        appearance: none;
        display: block;
        padding-right: 1.5em;
      }
    `;

    window.document.head.appendChild(selectStyle);  
  
    return () => {  
      window.document.head.removeChild(selectStyle);  
    };  
  }, []);

  return (
    <div className={`select_wrapper-box ${wrapperClassname}`}>
      <Component {...props} className={`select_masked ${className}`} ref={ref}>{children}</Component>
      {hasChildren(children, 0) ? null : <label htmlFor={id} className={labelClassName}>
          {
            hasChildren(children, 1)
              ? React.cloneElement(
                children as React.ReactElement<
                  { required: boolean }
                >,
                {
                  required: props.required
                }
              )
              : null
          }
        </label>}
    </div>
  );
}

const Option: FC<{
  React.ComponentProps<"option">
}> = ({ value, children, ...props }) => {
  return <option {...props} value={value}>{children}</option>
}

const SelectBox = Object.assign(SelectBox, { Option });

type SelectBoxProps = React.ComponentProps<typeof SelectBox>;

export type { SelectBoxProps };

export default SelectBox;

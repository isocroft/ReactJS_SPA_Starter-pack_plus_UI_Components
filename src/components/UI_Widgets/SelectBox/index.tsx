import React, { FC, Ref, useEffect, useRef } from "react";

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
    labelPosition?: "beforeInput" | "afterInput";
    valueSync?: boolean;
    children?: React.ReactNode;
    renderOptions: () => React.ReactNode;
    chevronIconSize?: number;
    chevronIconFillColor?: string;
  } &
   CustomElementTagProps<"select">
  > = React.forwardRef(({
  children,
  wrapperClassName,
  labelClassName,
  labelPosition = "afterInput",
  className,
  as: Component = "select",
  chevronIconSize,
  chevronIconFillColor,
  name,
  onChange,
  onBlur,
  renderOptions,
  defaultValue = "",
  valueSync = "" 
  ...props
}, ref: Ref<HTMLSelectElement>) => {
  const anyValue = (
    defaultValue !== "" ? defaultValue : props.value
  ) as string;
  const selectRef = useRef<HTMLSelectElement | null>(null);
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

  useEffect(() => {
    if (!valueSync || selectRef.current === null || anyValue === "") {
      return;
    }
    /* @NOTE: Programmatically trigger a `change` event on a <select> tag */
    /* @CHECK: https://github.com/facebook/react/issues/19678#issuecomment-679044981 */
    const selectOptions = Array.from(selectRef.current.options);
    const selectTagIndexMap = selectOptions.reduce(
      (indexMap, currentOption, index) => {
        indexMap[currentOption.value.toLowerCase()] = index;
        return indexMap;
      },
      {} as Record<string, number>
    );

    const programmaticChangeEvent = new Event("change", { bubbles: true });
    const setSelectTagIndex = Object.getOwnPropertyDescriptor(
      HTMLSelectElement.prototype,
      "selectedIndex"
    )!.set;

    if (typeof setSelectTagIndex !== "undefined") {
      setSelectTagIndex.call(
        selectRef.current,
        selectTagIndexMap[anyValue.toLowerCase()]
      );
      selectRef.current.dispatchEvent(programmaticChangeEvent);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [valueSync, anyValue]);

  return (
    <div className={`select_wrapper-box ${wrapperClassname}`}>
      {hasChildren(children, 0) ? null : (labelPosition === "beforeInput" && (<label htmlFor={id} className={labelClassName}>
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
        </label>) || null)}
      <Component
        className={`select_masked ${className}`}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
        defaultValue={
          !props.value && defaultValue !== "" ? defaultValue : undefined
        }
        ref={(node) => {
            if (node) {
              selectRef.current = node;
            }
            return typeof ref === "function" ? ref(node) : ref;
          }>
        {typeof renderOptions === "function" ? renderOptions().props.children : null}
      </Component>
      {hasChildren(children, 0) ? null : (labelPosition === "afterInput" && (<label htmlFor={id} className={labelClassName}>
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
        </label>) || null)}
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

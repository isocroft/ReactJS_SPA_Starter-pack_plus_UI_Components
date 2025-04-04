import React, { FC, Ref, useRef, useCallback, useEffect } from "react";

import { hasChildren } from "../../../helpers/render-utils";

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentProps<T> & {
    as?: T;
    children: undefined;
  };

const SelectBox: FC<
  {
    placeholder?: string;
    wrapperClassName?: string;
    valueSync?: boolean;
    children?: React.ReactNode;
    chevronIconSize?: number;
    chevronIconFillColor?: string;
  } &
   CustomElementTagProps<"select">
  > = React.forwardRef(({
  children,
  wrapperClassName = "",
  className = "",
  as: Component = "select",
  chevronIconSize,
  chevronIconFillColor,
  name,
  onChange,
  onBlur,
  defaultValue = "",
  valueSync = "" 
  ...props
}, ref: Ref<HTMLSelectElement>) => {
  const anyValue = (
    defaultValue ? defaultValue : props.value
  ) as string;
  const selectRef = useRef<HTMLSelectElement | null>(null);

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

  const $ref = useCallback((node) => {
    if (node) {
      selectRef.current = node;
    } else {
      selectRef.current = null;
    }
    return typeof ref === "function" ? ref(node) : ref;
  }, []);

  return (
    <div className={`select_wrapper-box ${wrapperClassName}`}>
      <Component
        className={`select_masked ${className}`}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
        defaultValue={
          !props.value && defaultValue !== "" ? defaultValue : undefined
        }
        ref={$ref}
      >
        {hasChildren(children, 0) ? null : children}
      </Component>
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

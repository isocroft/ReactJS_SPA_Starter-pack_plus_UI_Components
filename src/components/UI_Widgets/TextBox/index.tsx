import React, { FC, Ref, useEffect } from "react";

import { hasChildren } from "../../../helpers/render-utils";

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentProps<T> & {
    as?: T;
    children: undefined;
  };

const TextBox: FC<
  CustomElementTagProps<"input" | "textarea"> &
    Omit<
      React.ComponentProps<"input">,
      | "type"
      | "ref"
      | "onChange"
      | "onInput"
      | "pattern"
      | "size"
      | "src"
      | "checked"
      | "multiple"
      | "defaultChecked"
      | "onInvalid"
    > &
    Omit<
      React.ComponentProps<"textarea">,
      | "wrap"
      | "cols"
      | "textLength"
      | "rows"
      | "onChange"
      | "onInput"
      | "ref"
      | "onInvalid"
    > & {
      rows?: number;
      cols?: number;
      wrap?: "hard" | "soft" | "off";
      pattern?: string;
      src?: string;
      size?: number;
      textLength?: number;
      onChange?: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void;
      onInput?: () => void;
      onInvalid?: () => void;
      type?: "text" | "password" | "number" | "email" | "search" | "url" | "date";
    } & {
      wrapperClassName?: string;
      labelClassName?: string;
    }
> = React.forwardRef(({
  as: Component = "input",
  id,
  name,
  type = "text",
  rows,
  cols,
  wrap = "off",
  pattern,
  src,
  size,
  onChange,
  children,
  wrapperClassName,
  labelClassName,
  className,
  tabIndex = 0,
  ...props
}, ref: Ref<HTMLInputElement & HTMLTextAreaElement>) => {
  useEffect(() => {  
    const styleSheetsOnly = [].slice.call<StyleSheetList, [], StyleSheet[]>(
      window.document.styleSheets
    ).filter(
      (sheet) => {
        if (sheet.ownerNode) {
          return sheet.ownerNode.nodeName === "STYLE"
        }
        return false
    }).map(
      (sheet) => {
        if (sheet.ownerNode
          && sheet.ownerNode instanceof Element) {
          return sheet.ownerNode.id
        }
        return "";
    }).filter(
      (id) => id !== ""
    );

    if (styleSheetsOnly.length > 0
      && styleSheetsOnly.includes("react-busser-headless-ui_text")) {
      return;
    }

    const textStyle = window.document.createElement('style');
    textStyle.id = "react-busser-headless-ui_text";

    textStyle.innerHTML = `  
      .text_wrapper-box {
        overflow: hidden;
      }
    `;  
    window.document.head.appendChild(textStyle);  
 
    return () => {  
      window.document.head.removeChild(textStyle);  
    };  
  }, []);

  return (
    <>
      <div className={wrapperClassName}>
        <Component
          rows={
            typeof rows === "number" && Component === "textarea"
              ? rows
              : undefined
          }
          cols={
            typeof cols === "number" && Component === "textarea"
              ? cols
              : undefined
          }
          wrap={
            typeof wrap === "string" && Component === "textarea"
              ? wrap
              : undefined
          }
          textLength={
            typeof textLength === "number" && Component === "textarea" ? type : undefined
          }
          type={
            typeof type === "string" && Component === "input" ? type : undefined
          }
          onChange={typeof onChange === "function" ? onChange : undefined}
          pattern={
            typeof pattern === "string" && Component === "input"
              ? pattern
              : undefined
          }
          src={
            typeof src === "string" && Component === "input" ? src : undefined
          }
          size={
            typeof size === "number" && Component === "input" ? size : undefined
          }
          id={id}
          name={name}
          tabIndex={tabIndex}
          className={className}
          {...props}
          ref={ref}
        />
        {hasChildren(children, 0) ? null : <label htmlFor={name} className={labelClassName}>
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
    </>
  );
});

type TextBoxProps = React.ComponentProps<typeof TextBox>;

export type { TextBoxProps };

export default TextBox;

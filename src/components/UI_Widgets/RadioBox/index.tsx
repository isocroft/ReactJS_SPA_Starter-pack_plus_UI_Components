import React, { FC, Ref, useEffect } from "react";

import { hasChildren } from "../../../helpers/render-utils";
import { CircleIcon } from "./assets/CircleIcon";
import { RadioIcon } from "../RadioBoxList";

const RadioBox: FC<
  {
    wrapperClassName?: string;
    labelClassName?: string;
    labelPosition?: "beforeInput" | "afterInput";
    children?: React.ReactNode;
    displayStyle?: "transparent" | "adjusted";
    radioIconSize?: number;
    radioIconStrokeColor?: string;
    ref?: Ref<HTMLInputElement>;
  } &
   Omit<React.ComponentProps<"input">, "type" | "placeholder" | "ref">
> = React.forwardRef(({
  id,
  name,
  tabIndex = 0,
  wrapperClassName = "",
  labelClassName = "",
  labelPosition = "beforeInput",
  className = "",
  children,
  radioIconSize = 16,
  radioIconStrokeColor,
  displayStyle = "transparent",
  onChange,
  onBlur,
  ...props
}, ref: Ref<HTMLInputElement>) => {
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
      && styleSheetsOnly.includes("react-busser-headless-ui_radio")) {
      return;
    }

    const radioStyle = window.document.createElement('style');
    radioStyle.id = "react-busser-headless-ui_radio";

    radioStyle.innerHTML = `
      .radio_wrapper-box {
        position: static;
        display: inline-block; /* shrink-to-fit trigger */
        min-height: 0;
        min-width: fit-content;
      }

      .radio_hidden-input[data-display-style="transparent"] {
        opacity: 0;
      }

      .radio_hidden-input[data-display-style="adjusted"] {
        -moz-appearance: -moz-none;
        -moz-apperance: none;
        -webkit-appearance: none;
        appearance: none;
      }

      .radio_hidden-input {
        position: absolute;
        display: inline-block;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        border: none;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }

      /*.radio_hidden-input:checked + svg rect {
        stroke: #888888;
        fill: #23ef4b;
      }*/

      .radio_control-icon-box {
        min-height: 0;
        min-width: fit-content;
        position: relative;
        display: inline-block;
        vertical-align: middle;
      }
    `;  
    window.document.head.appendChild(radioStyle);  
  
    return () => {  
      window.document.head.removeChild(radioStyle);  
    };  
  }, []);

  let ariaInvalid = false;

  if (typeof props["aria-invalid"] === "boolean") {
    ariaInvalid = props["aria-invalid"];
    delete props["aria-invalid"];
  }

  return (
    <div {...props} aria-invalid={undefined} className={wrapperClassName} tabIndex={tabIndex}>
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
      <span
        className={`
          radio_control-icon-box ${className}
        `}
      >
        <input
          id={id}
          name={name}
          type="radio"
          data-display-style={displayStyle}
          onChange={onChange}
          onBlur={onBlur}
          {...props}
          aria-invalid={ariaInvalid}
          className={"radio_hidden-input"}
          ref={ref}
        />
        {typeof radioIconSize === "number" ? (<CircleIcon
          size={radioIconSize}
          iconStroke={radioIconStrokeColor}
        />) : null}
      </span>
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
});

type RadioBoxProps = React.ComponentProps<typeof RadioBox>;

export { RadioIcon };

export type { RadioBoxProps };

export default RadioBox;

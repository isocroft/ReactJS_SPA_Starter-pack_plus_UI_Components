import React, { FC, useEffect } from "react";

import { hasChildren } from "../../../helpers/render-utils";
import { CircleIcon } form "./assets/CircleIcon";

const RadioBox: FC<
  {
    placeholder?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    children?: React.ReactNode;
    radioIconSize?: number,
    radioIconFillColor?: string;
  } &
   Omit<React.ComponentPropsWithRef<"input">, "type" | "placeholder">
> = ({
  id,
  name,
  tabIndex = 0,
  wrapperClassName,
  labelClassName,
  className,
  children,
  raddioIconSize,
  radioIconFillColor,
  ...props
}) => {
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

      .radio_hidden-input {
        opacity: 0;
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

  return (
    <div className={wrapperClassName}>
      <span
        className={`
          radio_control-icon-box ${className}
        `}
      >
        <input
          id={id}
          tabIndex={tabIndex}
          name={name}
          type="radio"
          {...props}
          className={"radio_hidden-input"}
        />
        {typeof radioIconSize === "number" ? (<CircleIcon
          size={radioIconSize}
          iconStroke={radioIconStrokeColor}
        />) : null}
      </span>
      {hasChildren(children, 0) ? null :<label htmlFor={id} className={labelClassName}>
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
};

type RadioBoxProps = React.ComponentProps<typeof RadioBox>;

export type { RadioBoxProps };

export default RadioBox;

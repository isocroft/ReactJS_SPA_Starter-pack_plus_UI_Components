import React, { Ref, useEffect } from "react";

import { EllipseIcon } from "./assets/EllipseIcon";

import { hasChildren } from "../../../helpers/render-utils";

const SwitchBox = React.forwardRef(
  (
    {
      id,
      children,
      switchWidgetSize = 16,
      tabIndex = 0,
      switchActiveText = "",
      switchInactiveText = "",
      wrapperClassName = "",
      labelClassName = "",
      className = "",
      labelPosition = "beforeInput",
      onChange,
      onBlur,
      name,
      ...props
    }: Pick<
      React.ComponentProps<"input">,
      | "checked"
      | "disabled"
      | "required"
      | "readOnly"
      | "onChange"
      | "onBlur"
      | "className"
      | "name"
      | "id"
    > & {
      tabIndex?: number;
      children?: React.ReactNode;
      switchWidgetSize?: number;
      switchActiveText?: string;
      switchInactiveText?: string;
      wrapperClassName?: string;
      labelClassName?: string;
      labelPosition?: "beforeInput" | "afterInput";
    },
    ref: Ref<HTMLInputElement>
  ) => {
    useEffect(() => {
      const styleSheetsOnly = [].slice
        .call<StyleSheetList, [], StyleSheet[]>(window.document.styleSheets)
        .filter((sheet) => {
          if (sheet.ownerNode) {
            return sheet.ownerNode.nodeName === "STYLE";
          }
          return false;
        })
        .map((sheet) => {
          if (sheet.ownerNode && sheet.ownerNode instanceof Element) {
            return sheet.ownerNode.id;
          }
          return "";
        })
        .filter((id) => id !== "");

      if (
        styleSheetsOnly.length > 0 &&
        /* @ts-ignore */
        styleSheetsOnly.includes("react-busser-headless-ui_switch")
      ) {
        return;
      }

      const switchStyle = window.document.createElement("style");
      switchStyle.id = "react-busser-headless-ui_switch";

      switchStyle.innerHTML = `
      :root {
        --switch-wrapper-box-font-size: 0.8em;
      }

      .switch_wrapper-box  {
        display: inline-block; /* shrink-to-fit trigger */
        position: relative;
        padding: 0;
        margin: 0;
        min-height: 0;
        min-width: fit-content;
        border-radius: 2rem;
        overflow: hidden;
        box-shadow: 0 1px 3px #0003 inset;
        font-size: var(--switch-wrapper-box-font-size);
      }
      
      .switch_wrapper-box svg {
        margin: 0;
        padding: 0;
        position: relative;
        z-index: 0;
        display: inline-block;
      }
      
      .switch_wrapper-box input {
        display: inline-block;
        margin: 0;
        padding: 0;
        vertical-align: middle;
        -moz-appearance: -moz-none;
        -moz-appearance: none;
        -webkit-appearance: none;
        appearance: none;
        position: absolute;
        /* transition: 0.25s linear background-color; */
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        cursor: pointer;
      }
      
      .switch_wrapper-box input::before {
        content: '';
        display: inline-block;
        width: 45%;
        height: 75%;
        border-radius: 1.2rem;
        position: absolute;
        top: 12.5%;
        left: 7%;
        right: auto;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: 0.25s linear left;
      }
      
      /*
      .switch_wrapper-box input:checked {
        background-color: green;
      }
      */
      
      .switch_wrapper-box input:checked::before {
        left: 49%;
      }

      /*
      .switch_wrapper-box input:focus-visible {
        outline: 2px solid dodgerblue;
        outline-offset: 2px;
      }
      */
      
      .switch_wrapper-box span {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
      }
      
      .switch_wrapper-box span::before {
        content: attr(data-switch-on-text);
        position: relative;
        pointer-events: none;
        z-index: 20;
        font-size: 0.8em;
        left: 0;
        opacity: 0;
        transition: left 0.5s ease-in-out, opacity 0s ease-in;
      }
      
      .switch_wrapper-box input ~ span::after {
        content: attr(data-switch-off-text);
        position: relative;
        z-index: 20;
        pointer-events: none;
        font-size: 0.8em;
        right: 10%;
        opacity: 1;
        transition: right 0.5s ease-in-out, opacity 0s ease-in;
      }
      
      .switch_wrapper-box input:checked ~ span::before {
        left: 10%;
        opacity: 1;
      }
      
      .switch_wrapper-box input:checked ~ span::after {
        right: 0;
        opacity: 0;
      }
      
      .switch_wrapper-box input:focus {
        outline-color: transparent;
      }
      
    `;
      window.document.head.appendChild(switchStyle);

      return () => {
        window.document.head.removeChild(switchStyle);
      };
    }, []);

    useEffect(() => {
      const topRange = switchWidgetSize * 2;
      const downRange = switchWidgetSize + 4;

      const dimension = topRange / downRange;
      const factor = dimension <= 1.6 ? 3 : 2;

      document.documentElement.style.setProperty(
        "--switch-wrapper-box-font-size",
        (dimension / factor).toFixed(4) + "em"
      );
    }, [switchWidgetSize]);

    return (
      <div className={wrapperClassName} tabIndex={tabIndex}>
        {hasChildren(children, 0)
          ? null
          : (labelPosition === "beforeInput" && (
              <label htmlFor={id} className={labelClassName}>
                {hasChildren(children, 1)
                  ? React.cloneElement(
                      children as React.ReactElement<{
                        required: boolean;
                        switchActiveText: string;
                        switchInactiveText: string;
                      }>,
                      {
                        required: props.required,
                        switchActiveText,
                        switchInactiveText,
                      }
                    )
                  : null}
              </label>
            )) ||
            null}
        <p className={"switch_wrapper-box"}>
          <EllipseIcon size={switchWidgetSize} />
          <input
            {...props}
            id={id}
            name={name}
            ref={ref}
            type="checkbox"
            className={className}
            onBlur={onBlur}
            onChange={(
              event: React.MouseEvent<HTMLInputElement> & {
                target: HTMLInputElement;
              }
            ) => {
              const status = event.target.checked;
              if (status) {
                if (
                  switchActiveText !== "" &&
                  typeof switchActiveText === "string"
                ) {
                  /* @ts-ignore */
                  event.currentValue = switchActiveText;
                }
              } else {
                if (
                  switchInactiveText !== "" &&
                  typeof switchInactiveText === "string"
                ) {
                  /* @ts-ignore */
                  event.currentValue = switchInactiveText;
                }
              }

              if (typeof onChange === "function") {
                return onChange(event);
              }
            }}
          />
          <span
            data-switch-on-text={switchActiveText}
            data-switch-off-text={switchInactiveText}
          ></span>
        </p>
        {hasChildren(children, 0)
          ? null
          : (labelPosition === "afterInput" && (
              <label htmlFor={id} className={labelClassName}>
                {hasChildren(children, 1)
                  ? React.cloneElement(
                      children as React.ReactElement<{
                        required: boolean;
                        switchActiveText: string;
                        switchInactiveText: string;
                      }>,
                      {
                        required: props.required,
                        switchActiveText,
                        switchInactiveText,
                      }
                    )
                  : null}
              </label>
            )) ||
            null}
      </div>
    );
  }
);

/*
  import React, { useState } from "react";

  const [switchStatus, setSwitcStatus] = useState(true);
  const screenReaderText = "Tick-Tok!";

  <SwitchBox
        switchWidgetSize={SwitchWidget.WidgetSizes.MID}
        switchActiveText={"On"}
        checked={switchStatus}
        switchInactiveText={"Off"}
        labelPosition={"afterInput"}
        labelClassName={"text-[#333344] ml-2"}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSwitcStatus(e.target.checked);
        }}
    >
      <span className="sr-only">{screenReaderText}</span>
    </SwitchBox>
*/

export const SwitchWidget = {
  'WidgetSizes': {
    TINY: 16,
    MID: 22,
    BIG: 24,
    LARGE: 29
  }
};

type SwitchBoxProps = React.ComponentProps<typeof SwitchBox>;

export type { SwitchBoxProps };

export default SwitchBox;

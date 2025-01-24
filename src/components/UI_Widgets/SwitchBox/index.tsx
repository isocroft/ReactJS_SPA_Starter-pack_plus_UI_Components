import React, { Ref, useEffect } from "react";

import { EllipseIcon } form "./assets/EllipseIcon";

import { hasChildren } from "../../../helpers/render-utils";

/*
import { React, useEffect, useMemo, useState } from 'react';
import styles from './Switch.module.scss';
import { Color } from '../../../components/interfaces';
import { Switch as Toggle } from '@headlessui/react';

import classNames from 'classnames';

export type SwitchType = {
  color?: Color;
  checked: boolean;
  disabled?: boolean;
  screenReaderText: string;
  onChange: (checked: boolean) => void;
  className?: string;
  uncheckedStyle?: string;
};
export const Switch = ({
  color = 'secondary',
  checked,
  screenReaderText,
  disabled,
  onChange,
  className,
  uncheckedStyle
}: SwitchType) => {
  const [enabled, setEnabled] = useState(checked);

  const onToggle = (newValue: boolean) => {
    setEnabled(newValue);
    onChange(newValue);
  };

  useEffect(() => {
    setEnabled(checked);
  }, [checked]);

  return (
    <Toggle
      checked={enabled}
      onChange={onToggle}
      className={classNames(
        styles.switch,
        styles[color],
        disabled ? styles.disabled : '',
        enabled ? styles.enabled : '',
        !enabled ? uncheckedStyle : '',
        className
      )}
      disabled={disabled}
    >
      <span className="sr-only">{screenReaderText}</span>
      <span className={classNames(styles.dot, enabled ? styles.enabled : '')} />
    </Toggle>
  );
};
*/

const SwitchBox = React.forwardRef(({
  id,
  switchIconSize = 16,
  tabIndex = 0,
  switchActiveText = '',
  switchInactiveText = '',
  wrapperClassName = '',
  labelClassName = '',
  labelPosition = "beforeInput"
  ...props
}: Pick<React.ComponentProps<"input">, "checked" | "disabled" | "required" | "readonly" | "onChange" | "onBlur" | "name" | "id"> & {
  tabIndex? number;
  switchIconSize?: number;
  switchActiveText?: string;
  switchInactiveText?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  labelPosition?: "beforeInput" | "afterInput";
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
      && styleSheetsOnly.includes("react-busser-headless-ui_switch")) {
      return;
    }

    const switchStyle = window.document.createElement('style');
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
      
      .switch_wrapper-box input:focus-visible {
        outline: 2px solid dodgerblue;
        outline-offset: 2px;
      }
      
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
    const topRange = switchIconSize * 2;
    const downRange = switchIconSize + 4;

    const dimension = (topRange/downRange);
    const factor = dimension <= 1.6 ? 3 : 2;

    document.documentElement.style.setProperty(
      '--switch-wrapper-box-font-size',
      (dimension/factor).toFixed(4) + 'em'
    );
  }, [switchIconSize]);

  return (
    <div className={wrapperClassName} tabIndex={tabIndex}>
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
      <p className={"switch_wrapper-box"}>
        <EllipseIcon size={switchIconSize} />
        <input {...props} id={id} ref={ref} type="checkbox" className={className} />
        <span data-switch-on-text={switchActiveText} data-switch-off-text={switchInactiveText}></span>
      </p>
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


type SwitchBoxProps = React.ComponentProps<typeof SwitchBox>;

export { SwitchWidget };

export type { SwitchBoxProps };

export default SwitchBox;

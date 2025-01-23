import React, { useEffect } from "react";

import { EllipseIcon } form "./assets/EllipseIcon";

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

const Switch = ({ swicthIconSize, ...props }: Pick<React.ComponentProps<"input">, "checked" | "disabled" | "required" | "onChange" | "onBlur"> & {
  swicthIconSize?: number
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
      && styleSheetsOnly.includes("react-busser-headless-ui_switch")) {
      return;
    }

    const switchStyle = window.document.createElement('style');
    switchStyle.id = "react-busser-headless-ui_switch";

    switchStyle.innerHTML = `
  
      .switch_wrapper-box {
        position: static;
        display: inline-block; /* shrink-to-fit trigger */
        min-height: 0;
        min-width: fit-content;
      }
      
    `;  
    window.document.head.appendChild(switchStyle);  
  
    return () => {  
      window.document.head.removeChild(switchStyle);  
    };  
  }, []);

  return (
    <p className="switch_wrapper-box">
       <EllipseIcon size={swicthIconSize} />
       <input {...props} type="checkbox" classname />
      <span data-switch-on-text="Yes"></span>
    </p>
  );
};

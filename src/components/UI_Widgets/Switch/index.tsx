import React from "react"

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

const Switch = ({ ...props }: Pick<React.ComponentProps<"input">, "checked" | "disabled" | "required" | "onChange" | "onBlur">) => {
  return (
    <p class="switch">
       <svg  width="58" height="29" viewBox="0 0 26 26" fill="none">
          <rect x="0.5" y="0.5" width="30" height="30" rx="15" fill="transparent" stroke="transparent" />
        </svg>
       <input {...props} type="checkbox" />
      <span data-switch-on-text="Yes"></span>
    </p>
  );
};

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

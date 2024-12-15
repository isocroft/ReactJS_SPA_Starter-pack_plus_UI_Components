import React, { FC } from "react";

const Button: FC<React.ComponentProps<"button">> = ({
  id,
  name,
  tabIndex = 0,
  children,
  ...props
}) => {
  return (
    <button id={id} name={name} tabIndex={tabIndex} {...props}>
      {children}
    </button>
  );
};

/*
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from "tailwind-merge";

export function clsxn  (...classNameValues: ClassValue[]) {
  return twMerge(clsx(classNameValues));
}
*/

/*
import React from 'react';
import Button, { type ButtonProps } from '@/components/UI_Widgets/Button';

import clsxn from './helpers';
import { cva } from 'class-variance-authority';

const buttonStyles = cva(
  'base-button',
  {
    variants: {
      size: {
        small: 'button-small',
        medium: 'button-medium',
        large: 'button-large',
      },
      color: {
        primary: 'button-primary',
        secondary: 'button-secondary',
      },
    },
    defaultVariants: {
      size: 'medium',
      color: 'primary',
    },
  }
);

const Button = ({ size, color, children }: ButtonProps) => {
  return (
    <Button className={clsxn(buttonStyles({ size, color }))}>
      {children}
    </Button>
  );
};
*/

type ButtonProps = React.ComponentProps<typeof Button>;

export type { ButtonProps };

export default Button;

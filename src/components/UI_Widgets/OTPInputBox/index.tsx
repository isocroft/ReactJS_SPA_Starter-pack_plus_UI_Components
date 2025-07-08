import React, { useState, useEffect } from "react";
import InputBox from "../InputBox";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";

import type { InputBoxProps } from "../InputBox";

// constants
const MAX_NUMBER_INPUTS = numOfInputs;
const MIN_LENGTH_INPUT = 1;
const MAX_LENGTH_INPUT = 1;
const NUMBER_REGEX = /^[0-9]+$/;
const ALL_REGEX = /^.+$/;
const INPUT_TYPE = masked ? 'password' : (entryType === 'numeric' ? 'tel' : 'text');
const OTP_VALUE_ARR = typeof value === 'string' ? value.split('').slice(0, MAX_NUMBER_INPUTS) : [];
const OTP_PLACEHOLDER_ARR = typeof placeholder === 'string' ? placeholder.split('').slice(0, MAX_NUMBER_INPUTS) : [];

const [inputRefs] = useState(
  Array.from({ length: MAX_NUMBER_INPUTS }, () => React.createRef<HTMLInputElement | undefined>(undefined))
);
const handleInputFocusOnClick = (event: React.MouseEvent<HTMLInputElement> & { target: HTMLInputElement }) => event.target.select();
// Priority: isOnlyNumberAllowed > allCharactersAllowed
const [selectedRegex] = useState(entryType === 'numeric' ? NUMBER_REGEX : ALL_REGEX);

const focusNextInput = (index: number): boolean => {
  if (index >= MAX_NUMBER_INPUTS - 1 || index < -1) {
    return false;
  }

  const nextInputRef = inputRefs[index + 1];

  return nextInputRef.current ? nextInputRef.current.focus(), true : false;
};

const focusPrevInput = (index: number): boolean => {
  if (index <= 0) {
    return false;
  }

  const prevInputRef = inputRefs[index - 1];

  return prevInputRef.current ? prevInputRef.current.focus(), true : false;
};

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentPropsWithRef<T> & {
    as?: T;
  };

function ClonedFormInputElements ({
  as: Component = "div",
  children,
  count = 1,
  keyPrefix = "cloned",
  elementProps = { type: "text" },
  ...props
}: {
  count?: number,
  keyPrefix?: string,
  elementProps?: React.ComponentPropsWithRef<"input">,
} & CustomElementTagProps<"nav" | "header" | "section" | "div"> &
    Omit<React.ComponentProps<"div">, "align">
) {
  const childrenArray = React.Children.toArray(children);
  const firstChild = childrenArray[0];

  if (!firstChild || !isSubChild(firstChild, "InputBox") || hasChildren(children, 0)) {
    return null;
  }

  const clonedElements = Array.from({ length: count }, (_, index) => {
    return React.cloneElement<InputBoxProps>(
      firstChild,
      { key: `${keyPrefix}-${index}`, ...elementProps, valueSync: true, 'data-clone-index': String(index) }
    );
  });

  return (
    <Component {..props}>
      {clonedElements}
    </Component>
  );
}


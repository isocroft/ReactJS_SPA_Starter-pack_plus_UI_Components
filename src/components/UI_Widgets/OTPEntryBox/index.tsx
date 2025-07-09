import React, { useState, useEffect } from "react";
import InputBox from "../InputBox";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";

import type { InputBoxProps } from "../InputBox";

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
  elementProps?: Pick<React.ComponentPropsWithRef<"input">, "text" | "inputMode" | "maxLength" | "minLength" | "size" | "name" | "" | "" | "" | "">,
} & CustomElementTagProps<"nav" | "header" | "section" | "div"> &
    Omit<React.ComponentProps<"div">, "align">
) {
  const childrenArray = React.Children.toArray(children);
  const firstChild = childrenArray[0];

  if (typeof keyPrefix !== "string" || !firstChild || !isSubChild(firstChild, "InputBox") || hasChildren(children, 0)) {
    return null;
  }

  const clonedElements = Array.from({ length: count }, (_, index) => {
    return React.cloneElement<InputBoxProps>(
      firstChild,
      { key: `${keyPrefix.toLowerCase()}-${index}`, ...elementProps, valueSync: true, `data-${keyPrefix.toLowerCase()}-index`: String(index) }
    );
  });

  return (
    <Component {..props}>
      {clonedElements}
    </Component>
  );
}

const OTPEntryBox = ({ masked = false, entryType = 'numeric', placeholder, slots = 4, required = false }: {
  masked?: boolean,
  entryType?: 'numeric' | 'text',
  placeholder: string,
  slots?: number,
  required?: boolean,
  children
}) => {
  // constants
  const MAX_NUMBER_INPUTS = slots;
  const MIN_LENGTH_INPUT = 1;
  const MAX_LENGTH_INPUT = 1;
  const NUMBER_REGEX = /^[0-9]+$/;
  const ALL_REGEX = /^.+$/;
  const INPUT_TYPE = masked ? 'password' : (entryType === 'numeric' ? 'tel' : 'text');
  const OTP_VALUE_ARR = typeof value === 'string' ? value.split('').slice(0, MAX_NUMBER_INPUTS) : [];
  const OTP_PLACEHOLDER_ARR = typeof placeholder === 'string' ? placeholder.split('').slice(0, MAX_NUMBER_INPUTS) : [];
  const INPUT_CORE_PROPS = { type: INPUT_TYPE, name: "cloned[]", required, minLength: "1", maxlength: "1", size: "1", inputMode: "numeric" };

  const [inputRefs] = useState(
    Array.from({ length: MAX_NUMBER_INPUTS }, () => React.createRef<HTMLInputElement | undefined>(undefined))
  );
  const handleInputFocusOnClick = (event: React.MouseEvent<HTMLInputElement> & { target: HTMLInputElement }) => event.target.select();
  // Priority: entryType > allCharactersAllowed
  const [selectedRegex] = useState<RegExp>(entryType === 'numeric' ? NUMBER_REGEX : ALL_REGEX);
  
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

  const handleInputValue = (event: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }): void => {
    const inputValue = event.target.value;
    const index = Number(event.target.dataset[`${keyPrefix.toLowerCase()}Index`]);

    if (selectedRegex.test(inputValue)) {
      setInputLettersArray([
        ...inputLettersArray.slice(0, index),
        inputValue,
        ...inputLettersArray.slice(index + 1)
      ]);
      focusNextInput(index);
    }
  };

  return(
    <ClonedFormInputElements
      count={slots}
      elementProps={INPUT_CORE_PROPS}
      keyPrefix={"otpInput"}
      onChange={handleInputValue}
      onPaste={}
      onFocus={}
    >
      {children}
    </ClonedFormInputElements>
  );
};


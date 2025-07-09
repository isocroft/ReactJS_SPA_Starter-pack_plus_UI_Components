import React, { FC, useState, useEffect, useRef } from "react";
import InputBox from "../InputBox";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";

import type { InputBoxProps } from "../InputBox";

interface CompositionEvent<T = Element> extends SyntheticEvent<T, NativeCompositionEvent> {
  data: string;
}

type OTPEntryBoxProps = {
  name: string;
  masked?: boolean;
  entryType?: 'numeric' | 'text';
  placeholder?: string;
  slots?: number;
  required?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
  wrapperClassname?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  onComplete?: (value: string) => void; 
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
  defaultValues = "",
  ...props
}: {
  count?: number,
  keyPrefix?: string,
  defaultvalues?: string,
  elementProps?: Pick<React.ComponentPropsWithRef<"input">, "type" | "inputMode" | "maxLength" | "minLength" | "size" | "tabIndex" | "disabled">,
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
      { key: `${keyPrefix.toLowerCase()}-${index}`, ...elementProps, defaultValue: elementProps.type === 'tel' ? Number(defaultValues.charAt(index)) : defaultValues.charAt(index), valueSync: true, `data-${keyPrefix.toLowerCase()}-index`: String(index) }
    );
  });

  return (
    <Component {..props}>
      {clonedElements}
    </Component>
  );
}

const OTPEntryBox: FC<React.PropsWithChildren<OTPEntryBoxProps>> = ({
  name,
  masked = false,
  entryType = 'numeric',
  placeholder = "",
  slots = 4,
  required = false,
  disabled = false,
  className = "",
  wrapperClassname = "",
  onChange,
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
  const INPUT_CORE_PROPS = { type: INPUT_TYPE, required, disabled, tabIndex: 0, minLength: "1", maxlength: "1", size: "1", inputMode: "numeric" };

  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  // const [inputRefs] = useState(
  //   Array.from({ length: MAX_NUMBER_INPUTS }, () => React.createRef<HTMLInputElement | undefined>(undefined))
  // );
  const handleInputFocusOnClick = (event: React.MouseEvent<HTMLInputElement> & { target: HTMLInputElement }) => event.target.select();
  // Priority: entryType > allCharactersAllowed
  const [selectedRegex] = useState<RegExp>(entryType === 'numeric' ? NUMBER_REGEX : ALL_REGEX);
  
  const focusNextInput = (index: number, parentNode): boolean => {
    if (index >= MAX_NUMBER_INPUTS - 1 || index < -1) {
      return false;
    }
  
    const nextInputRef = //inputRefs[index + 1];
  
    return nextInputRef.current ? nextInputRef.current.focus(), true : false;
  };
  
  const focusPrevInput = (index: number, parentNode): boolean => {
    if (index <= 0) {
      return false;
    }
  
    const prevInputRef = //inputRefs[index - 1];
  
    return prevInputRef.current ? prevInputRef.current.focus(), true : false;
  };

  const handleOnInputChange = (event: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }): void => {
  
    const index = Number(event.target.dataset[`${keyPrefix.toLowerCase()}Index`]);
    const inputText = event.target.value;

    if (selectedRegex.test(inputText)) {
      setInputLettersArray([
        ...inputLettersArray.slice(0, index),
        inputText,
        ...inputLettersArray.slice(index + 1)
      ]);
      focusNextInput(index);
    }
  };

  const handleOnInputPaste = (event: React.ClipboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => {
    event.preventDefault();

    const index = Number(event.target.dataset[`${keyPrefix.toLowerCase()}Index`]);
    const pastedText = (event.clipboardData.getData('text/plain') || '').slice(0, MAX_NUMBER_INPUTS - index).split('');
    const isOverMaxLength = (index + pastedText.length) >= MAX_NUMBER_INPUTS;

    if (isOverMaxLength) {
      setInputLettersArray([
        ...inputLettersArray.slice(0, index),
        ...pastedText,
      ].slice(0, MAX_NUMBER_INPUTS));
    } else {
      setInputLettersArray([
        ...inputLettersArray.slice(0, index),
        ...pastedText,
        ...inputLettersArray.slice(pastedData.length + 1)
      ].slice(0, MAX_NUMBER_INPUTS));
    }
    
    focusNextInput(index + pastedText.length - 2);
  };

  const handleOnBeforeInputKeyDown = (event: React.CompositionEvent<HTMLInputElement>) => {
    const data = event.data;
    console.log(">>>>>> [input data]: ", data);
  };

  const handleOnInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => {
    const index = Number(event.target.dataset[`${keyPrefix.toLowerCase()}Index`]);

    if (
      event.keyCode === 8 || event.key === 'Backspace' || 
      event.keyCode === 46 || event.key === 'Delete'
    ) {
      const value = inputLettersArray[index];
      setInputLettersArray([
        ...inputLettersArray.slice(0, index),
        '',
        ...inputLettersArray.slice(index + 1)
      ]);
      if (!value) {
        focusPrevInput(index);
      }
    } else if (
      event.keyCode === 37 || event.key === 'ArrowLeft'
    ) {
      focusPrevInput(index);
    } else if (
      event.keyCode === 39 || event.key === 'ArrowRight'
    ) {
      focusNextInput(index);
    }
  };

  /*

  EXAMPLE CODE FOR `onPasteCapture`::::

  import React from 'react';

function MyComponent() {
  const handlePasteCapture = (event) => {
    // Access clipboard data
    const pastedText = event.clipboardData.getData('text');
    console.log('Pasted during capture phase:', pastedText);

    // Optional: Prevent default paste behavior
    // event.preventDefault(); 
    // console.log('Default paste prevented.');
  };

  return (
    <input 
      type="text" 
      onPasteCapture={handlePasteCapture} 
      placeholder="Paste something here" 
    />
  );
}

export default MyComponent;
  */

  return(
    <div className={wrapperClassname}>
      <input
        type={"hidden"}
        name={name}
        defaultValue={defaultValue}
        onChange={typeof onChange === 'function' ? onChange : undefined}
        ref={hiddenInputRef}
      >
      <ClonedFormInputElements
        count={slots}
        elementProps={INPUT_CORE_PROPS}
        keyPrefix={"otpInput"}
        defaultValues={defaultValue}
        onChange={handleOnInputChange}
        onPaste={handleOnInputPaste}
        onFocus={}
        onKeyDown={handleOnInputKeyDown}
        onBeforeInput={handleOnBeforeInputKeyDown}
        className={className}
      >
        {children}
      </ClonedFormInputElements>
    </div>
  );
};


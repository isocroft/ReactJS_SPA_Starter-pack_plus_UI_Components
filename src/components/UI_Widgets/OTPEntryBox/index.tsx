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
  inputMode?: 'numeric' | 'text' | 'decimal' | 'tel';
  placeholder?: string;
  slots?: number;
  required?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
  wrapperClassname?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  onComplete?: (value: string) => void;
  pasteTransformer?: (pastedText: string) => string;
  noScriptCSSFallback?: string | null;
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
  elementProps = { type: "text", placeholder: "", inputMode: "tel" },
  defaultValues = "",
  ...props
}: {
  count?: number,
  keyPrefix?: string,
  defaultvalues?: string,
  elementProps?: Pick<React.ComponentPropsWithRef<"input">, "type" | "inputMode" | "maxLength" | "minLength" | "size" | "tabIndex" | "disabled" | "placeholder">,
} & CustomElementTagProps<"nav" | "header" | "section" | "div"> &
    Omit<React.ComponentProps<"div">, "align">
) {
  const OTP_PLACEHOLDER_ARR = typeof elementProps.placeholder === 'string' && elementProps.placeholder.length > 0
    ? placeholder.split('').slice(0, count)
    : [];
  const childrenArray = React.Children.toArray(children);
  const firstChild = childrenArray[0];

  if (typeof keyPrefix !== "string" || !firstChild || !isSubChild(firstChild, "InputBox") || hasChildren(children, 0)) {
    return null;
  }

  const clonedElements = Array.from({ length: count }, (_, index) => {
    return React.cloneElement<InputBoxProps>(
      firstChild,
      {
        key: `${keyPrefix.toLowerCase()}-${index}`,
        ...elementProps,
        defaultValue: elementProps.type === 'tel' ? Number(defaultValues.charAt(index)) : defaultValues.charAt(index),
        valueSync: true,
        name: "",
        form: "", // Stop input from being submitted by any HTML form: `<input form="none" name="_">` OR `<input form="" name="">`
        `data-${keyPrefix.toLowerCase()}-index`: String(index),
        placeholder: OTP_PLACEHOLDER_ARR[index] || "*"
      }
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
  inputMode = 'numeric',
  placeholder = "",
  slots = 4,
  required = false,
  disabled = false,
  className = "",
  wrapperClassname = "",
  pasteTransformer = (pastedText: string) => pastedText,
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
  const INPUT_CORE_PROPS = {
    type: INPUT_TYPE,
    required,
    placeholder,
    disabled,
    tabIndex: 0,
    minLength: MIN_LENGTH_INPUT,
    maxlength: MAX_LENGTH_INPUT,
    size: 1,
    inputMode
  };

  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const setInputLettersArray = (letters: string[]): boolean => {
    let returnValue = false;
    if (!Array.isArray(letters)) {
      return returnValue;
    }

    if (hiddenInputRef.current) {
      const newValue = letters.join('');
      if (hiddenInputRef.current.value !== newValue) {
        /* @CHECK: https://www.designcise.com/web/tutorial/how-to-trigger-change-event-on-html-hidden-input-element-using-javascript */
        hiddenInputRef.current.value = newValue;
        returnValue = hiddenInputRef.current.dispatchEvent(new Event("change"));
      }
    }

    return returnValue;
  };

  const getInputLettersString = (): string => {
    if  (hiddenInputRef.current) {
      return hiddenInputRef.current.value;
    }

    return '';
  };

  // Priority: entryType > allCharactersAllowed
  const [selectedRegex] = useState<RegExp>(entryType === 'numeric' ? NUMBER_REGEX : ALL_REGEX);
  
  const focusNextInput = (index: number, parentNode: HTMLElement | null): boolean => {
    if (index >= MAX_NUMBER_INPUTS - 1 || index < -1) {
      return false;
    }

    const nextInputNode = parentNode ? parentNode.querySelector(
      `input[data-${keyPrefix.toLowerCase()}-index="${index + 1}"]`
    ) : null;
    return nextInputNode ? nextInputNode.focus(), true : false;
  };
  
  const focusPrevInput = (index: number, parentNode: HTMLElement | null): boolean => {
    if (index <= 0) {
      return false;
    }

    const prevInputNode = parentNode ? parentNode.querySelector(
      `input[data-${keyPrefix.toLowerCase()}-index="${index - 1}"]`
    ) : null;
    return prevInputNode ? prevInputNode.focus(), true : false;
  };

  const handleOnInputChange = (event: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }): void => {
  
    const index = Number(event.target.dataset[`${keyPrefix.toLowerCase()}Index`]);
    const inputLettersArray = getInputLettersString().split('');
    const inputText = event.target.value;

    if (selectedRegex.test(inputText)) {
      setInputLettersArray([
        ...inputLettersArray.slice(0, index),
        inputText,
        ...inputLettersArray.slice(index + 1)
      ]);
      focusNextInput(index, event.target.parentNode);
    }
  };

  const handlePasteCapture = (event: React.ClipboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => {
    const rawPastedText = event.clipboardData.getData('text/plain');
    const pastedText = rawPastedText.slice(0, MAX_NUMBER_INPUTS - 1);

    /* @HINT: Prevent default paste behavior */
    if (!selectedRegex.test(pastedText)) {
      event.preventDefault();
    }
  };

  const handleOnInputPaste = (event: React.ClipboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => {
    event.preventDefault();

    const index = Number(event.target.dataset[`${keyPrefix.toLowerCase()}Index`]);
    const rawPastedText = pasteTransformer(event.clipboardData.getData('text/plain') || '');
    const pastedText = rawPastedText.slice(0, MAX_NUMBER_INPUTS - index).split('');
    const inputLettersArray = getInputLettersString().slice('');
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

    focusNextInput(index + pastedText.length - 2, event.target.parentNode);
  };

  const handleOnBeforeInputKeyDown = (event: React.CompositionEvent<HTMLInputElement>) => {
    const data = event.data;
    console.log(">>>>>> [input data]: ", data);
  };

  const handleOnInputFocus = (event: React.FocusEvent<HTMLElement> & { target: HTMLInputElement }) => {
    const index = Number(event.target.dataset[`${keyPrefix.toLowerCase()}Index`]);
    console.log(">>>>>>> [input focused with index]: ", index);
    event.target.select();
  };

  const handleOnInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => {
    const index = Number(event.target.dataset[`${keyPrefix.toLowerCase()}Index`]);

    if (
      event.keyCode === 8 || event.key === 'Backspace' || 
      event.keyCode === 46 || event.key === 'Delete'
    ) {
      const inputLettersString = getInputLettersString();
      const inputLettersArray = inputLettersString.slice('');
      const value = inputLettersString.charAt(index);
      setInputLettersArray([
        ...inputLettersArray.slice(0, index),
        '',
        ...inputLettersArray.slice(index + 1)
      ]);
      if (!value) {
        focusPrevInput(index, event.target.parentNode);
      }
    } else if (
      event.keyCode === 37 || event.key === 'ArrowLeft'
    ) {
      focusPrevInput(index, event.target.parentNode);
    } else if (
      event.keyCode === 39 || event.key === 'ArrowRight'
    ) {
      focusNextInput(index, event.target.parentNode);
    }
  };

  return(
    <div className={wrapperClassname} onPasteCapture={handlePasteCapture}>
      <input
        type={"hidden"}
        name={name}
        value={defaultValue}
        onChange={typeof onChange === 'function' ? onChange : undefined}
        ref={hiddenInputRef}
      >
       {/*<input
          type={"hidden"}
          name={"_charset_"}
        >*/}
      <ClonedFormInputElements
        count={slots}
        elementProps={INPUT_CORE_PROPS}
        keyPrefix={"otpInput"}
        defaultValues={defaultValue}
        onChange={handleOnInputChange}
        onPaste={handleOnInputPaste}
        onFocus={handleOnInputFocus}
        onKeyDown={handleOnInputKeyDown}
        onBeforeInput={handleOnBeforeInputKeyDown}
        className={className}
      >
        {children}
      </ClonedFormInputElements>
    </div>
  );
};


import React, { FC, useState, useEffect, useRef } from "react";
import InputBox from "../InputBox";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";

import type { InputBoxProps } from "../InputBox";

interface CompositionEvent<T = Element>
  extends React.SyntheticEvent<T, CompositionEvent> {
  data: string;
}

type OTPEntryBoxProps = {
  name: string;
  masked?: boolean;
  entryType?: "numeric" | "text";
  inputMode?: "numeric" | "text" | "decimal" | "tel";
  placeholder?: string;
  slots?: number;
  required?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
  wrapperClassname?: string;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }
  ) => void;
  onComplete?: (value: string) => void;
  pasteTransformer?: (pastedText: string) => string;
  noScriptCSSFallback?: string | null;
};

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentPropsWithRef<T> & {
    as?: T;
  };

function ClonedFormInputElements({
  as: Component = "div",
  children,
  count = 1,
  keyPrefix = "cloned",
  elementProps = { type: "text", placeholder: "", inputMode: "tel" },
  defaultValues = "",
  ...props
}: {
  count?: number;
  keyPrefix?: string;
  defaultValues?: string;
  elementProps?: Pick<
    React.ComponentPropsWithRef<"input">,
    | "type"
    | "inputMode"
    | "maxLength"
    | "minLength"
    | "size"
    | "tabIndex"
    | "disabled"
    | "placeholder"
  >;
} & CustomElementTagProps<"nav" | "header" | "section" | "div"> &
  Omit<React.ComponentProps<"div">, "align">) {
  const OTP_PLACEHOLDER_ARR =
    typeof elementProps.placeholder === "string" &&
    elementProps.placeholder.length > 0
      ? elementProps.placeholder.split("").slice(0, count)
      : [];
  const childrenArray = React.Children.toArray(children);
  const firstChild = childrenArray[0] as React.ReactElement<
    InputBoxProps,
    React.JSXElementConstructor<InputBoxProps>
  >;

  if (
    typeof keyPrefix !== "string" ||
    !firstChild ||
    !isSubChild(firstChild, "CodeInput") ||
    hasChildren(children, 0)
  ) {
    return null;
  }

  const clonedElements = Array.from({ length: count }).map((_, index) => {
    if (React.isValidElement(firstChild)) {
      return React.cloneElement<InputBoxProps>(firstChild, {
        valueSync: true,
        ...elementProps,
        placeholder: OTP_PLACEHOLDER_ARR[index] || "*",
        name: "",
        form: "", // Stop input from being submitted by any HTML form: `<input form="none" name="_">` OR `<input form="" name="">`
        defaultValue: defaultValues.charAt(index) || "",
        key: `${keyPrefix.toLowerCase()}-${index}`,
        [`data-${keyPrefix.toLowerCase()}-index`]: String(index),
      });
    }
    return null;
  });

  return <Component {...props}>{clonedElements}</Component>;
}

const CodeEntryBox = ({
  name,
  masked = false,
  entryType = "numeric",
  inputMode = "numeric",
  placeholder = "",
  slots = 4,
  required = false,
  disabled = false,
  className = "",
  defaultValue = "",
  wrapperClassname = "",
  pasteTransformer = (pastedText: string) => pastedText,
  onChange,
  children,
}: React.PropsWithChildren<OTPEntryBoxProps>) => {
  /* @TODO Add dynamic generation of `keyPrefix` for different instances of `<CodeEntryBox />` */
  const keyPrefix = "vaGYeibxo";

  const MAX_NUMBER_INPUTS = slots;
  const MIN_LENGTH_INPUT = 1;
  const MAX_LENGTH_INPUT = 1;
  const NUMBER_REGEX = /^[0-9]+$/;
  const ALL_REGEX = /^.+$/;
  const INPUT_TYPE = masked
    ? "password"
    : entryType === "numeric"
    ? "tel"
    : "text";
  const INPUT_CORE_PROPS = {
    type: INPUT_TYPE,
    required,
    placeholder,
    disabled,
    tabIndex: 0,
    minLength: MIN_LENGTH_INPUT,
    maxLength: MAX_LENGTH_INPUT,
    size: 1,
    inputMode,
  };

  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const setInputLettersArray = (letters: string[]): boolean => {
    let returnValue = false;
    if (!Array.isArray(letters)) {
      return returnValue;
    }

    console.log("???", letters);

    if (hiddenInputRef.current) {
      const newValue = letters.join("");
      if (hiddenInputRef.current.value !== newValue) {
        const setInputValue = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value"
        )!.set;
        /* @CHECK: https://www.designcise.com/web/tutorial/how-to-trigger-change-event-on-html-hidden-input-element-using-javascript */
        if (typeof setInputValue !== "undefined") {
          setInputValue.call(hiddenInputRef.current, newValue);
          hiddenInputRef.current.dispatchEvent(
            new Event("input", { bubbles: true })
          );
        }
      }
    }

    return returnValue;
  };

  const getInputLettersString = (): string => {
    if (hiddenInputRef.current) {
      return hiddenInputRef.current.value;
    }

    return "";
  };

  // Priority: entryType > allCharactersAllowed
  const [selectedRegex] = useState<RegExp>(
    entryType === "numeric" ? NUMBER_REGEX : ALL_REGEX
  );

  const focusNextInput = (
    index: number,
    parentNode: ParentNode | null
  ): void => {
    if (index >= MAX_NUMBER_INPUTS - 1 || index < -1) {
      return;
    }

    const nextInputNode = parentNode
      ? parentNode.querySelector<HTMLInputElement>(
          `input[data-${keyPrefix.toLowerCase()}-index="${index + 1}"]`
        )
      : null;

    if (nextInputNode) {
      nextInputNode.focus();
    }
  };

  const focusPrevInput = (
    index: number,
    parentNode: ParentNode | null
  ): void => {
    if (index <= 0) {
      return;
    }

    const prevInputNode = parentNode
      ? parentNode.querySelector<HTMLInputElement>(
          `input[data-${keyPrefix.toLowerCase()}-index="${index - 1}"]`
        )
      : null;

    if (prevInputNode) {
      prevInputNode.focus();
    }
  };

  const handleOnInputChange = (
    event: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }
  ): void => {
    const index = Number(
      event.target.dataset[`${keyPrefix.toLowerCase()}Index`]
    );
    const inputLettersArray = getInputLettersString().split("");
    const inputText = event.target.value;

    if (selectedRegex.test(inputText)) {
      setInputLettersArray([
        ...inputLettersArray.slice(0, index),
        inputText,
        ...inputLettersArray.slice(index + 1),
      ]);
      focusNextInput(index, event.target.parentNode);
    }
  };

  const handlePasteCapture = (
    event: React.ClipboardEvent<HTMLInputElement> & { target: HTMLInputElement }
  ) => {
    const rawPastedText = event.clipboardData.getData("text/plain");
    console.log(">>,,,", rawPastedText);
    const pastedText = rawPastedText.slice(0, MAX_NUMBER_INPUTS);

    /* @HINT: Prevent default paste behavior */
    if (!selectedRegex.test(pastedText)) {
      console.log("POP");
      event.preventDefault();
    }
  };

  const handleOnInputPaste = (
    event: React.ClipboardEvent<HTMLInputElement> & { target: HTMLInputElement }
  ) => {
    event.preventDefault();

    const index = Number(
      event.target.dataset[`${keyPrefix.toLowerCase()}Index`]
    );
    const rawPastedText = pasteTransformer(
      event.clipboardData.getData("text/plain") || ""
    );
    const pastedText = rawPastedText
      .slice(0, MAX_NUMBER_INPUTS - index)
      .split("");
    const inputLettersArray = getInputLettersString().split("");
    const isOverMaxLength = index + pastedText.length >= MAX_NUMBER_INPUTS;

    let chars = [];

    if (isOverMaxLength) {
      chars = [...inputLettersArray.slice(0, index), ...pastedText].slice(
        0,
        MAX_NUMBER_INPUTS
      );
      setInputLettersArray(chars);
    } else {
      chars = [
        ...inputLettersArray.slice(0, index),
        ...pastedText,
        ...inputLettersArray.slice(pastedText.length + 1),
      ].slice(0, MAX_NUMBER_INPUTS);
      setInputLettersArray(chars);
    }

    focusNextInput(index + pastedText.length - 2, event.target.parentNode);
  };

  const handleOnBeforeInputKeyDown = (
    event: React.CompositionEvent<HTMLInputElement>
  ) => {
    const data = event.data;
    console.log(">>>>>> [input data]: ", data);
  };

  const handleOnInputFocus = (
    event: React.FocusEvent<HTMLInputElement> & { target: HTMLInputElement }
  ) => {
    const index = Number(
      event.target.dataset[`${keyPrefix.toLowerCase()}Index`]
    );
    console.log(">>>>>>> [input focused with index]: ", index);
    event.target.select();
  };

  const handleOnInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }
  ) => {
    const index = Number(
      event.target.dataset[`${keyPrefix.toLowerCase()}Index`]
    );

    if (
      event.keyCode === 8 ||
      event.key === "Backspace" ||
      event.keyCode === 46 ||
      event.key === "Delete"
    ) {
      event.preventDefault();
      const inputLettersString = getInputLettersString();
      const inputLettersArray = inputLettersString.split("");
      const value = inputLettersString.charAt(index);
      setInputLettersArray([
        ...inputLettersArray.slice(0, index),
        "",
        ...inputLettersArray.slice(index + 1),
      ]);
      if (value || event.target.value) {
        event.target.value = "";
        focusPrevInput(index, event.target.parentNode);
      }
    } else if (event.keyCode === 37 || event.key === "ArrowLeft") {
      focusPrevInput(index, event.target.parentNode);
    } else if (event.keyCode === 39 || event.key === "ArrowRight") {
      focusNextInput(index, event.target.parentNode);
    }
  };

  return (
    <div className={wrapperClassname} onPasteCapture={handlePasteCapture}>
      <input
        type={"text"}
        style={{
          fontSize: 0,
          padding: 0,
          visibility: "hidden",
          pointerEvents: "none",
          position: "absolute",
        }}
        name={name}
        defaultValue={defaultValue}
        onChange={typeof onChange === "function" ? onChange : undefined}
        ref={hiddenInputRef}
      />
      {/*<input
          type={"hidden"}
          name={"_charset_"}
        >*/}
      <ClonedFormInputElements
        count={slots}
        elementProps={INPUT_CORE_PROPS}
        keyPrefix={keyPrefix}
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

const CodeInput = ({
  ...props
}: Omit<InputBoxProps, "onChange" | "type" | "children">) => {
  return <InputBox {...props} />;
};

CodeEntryBox.Input = CodeInput;

export default CodeEntryBox;

/*
<CodeEntryBox
  name="okri"
  onChange={() => {
    console.log("haha!");
  }}
>
  <CodeEntryBox.Input />
</CodeEntryBox>
*/



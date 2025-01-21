import React, { FC, Ref, useEffect, useRef } from "react";

const InputBox: FC<React.ComponentProps<"input">> = React.forwardRef(({
  type = "text",
  defaultValue = "",
  tabIndex = 0,
  valueSync = false,
  ...props
}, ref: Ref<HTMLInputElement>) => {
  const anyValue = (
    defaultValue !== "" ? defaultValue : props.value
  ) as string;
  const inputBoxRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!valueSync || inputBoxRef.current === null || anyValue === "") {
      return;
    }
    /* @NOTE: Programmatically trigger a `change` event on a <input> tag */
    /* @CHECK: https://github.com/facebook/react/issues/19678#issuecomment-679044981 */
    const programmaticChangeEvent = new Event("input", { bubbles: true });
    const setInputValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )!.set;

    if (typeof setInputValue !== "undefined") {
      setInputValue.call(
        inputBoxRef.current,
        anyValue
      );
      inputBoxRef.current.dispatchEvent(programmaticChangeEvent);
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [valueSync, anyValue]);

  return (
    <input
      type={type}
      tabIndex={tabIndex}
      {...props}
      defaultValue={
        !props.value && defaultValue !== "" ? defaultValue : undefined
      }
      ref={(node) => {
        if (node) {
          inputBoxRef.current = node;
        }
        return typeof ref === "function" ? ref(node) : ref;
      }}
    />
  );
});

type InputBoxProps = React.ComponentProps<typeof InputBox>;

export type { InputBoxProps };

export default InputBox;

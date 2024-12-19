import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import TextBox from "../TextBox";

import type { TextBoxProps } from "../TextBox";

const ContextTextBox: TextBoxProps & { valueAsType: boolean, ErrorComponent?: React.FunctionComponent<{ isDirty: boolean, invalid: boolean, errorMessage: string | null }> } = ({
  name,
  type,
  placeholder,
  children,
  className,
  disabled,
  required,
  min,
  max,
  valueAsType = false,
  wrapperClassName,
  labelClassName,
  ErrorComponent,
  ...props
}) => {
  const { register, unregister, getFieldState, formState, resetField } = useFormContext();

  const { isDirty, invalid, error } = getFieldState(name, formState)
  const [timerId] = useState<ReturnType<typeof setTimeout>>(() =>
    setTimeout(() => {
      if (!props.value && !props.defaultValue) {
        resetField(name, { keepTouched: true })
      }
    }, 0)
  );

  useEffect(() => {
    return () => {
      if (typeof timerId === "number") {
        clearTimeout(timerId)
      }
      unregister(name);
    }
  }, [timerId]);

  const extraRegisterOptions = {};

  switch (type) {
    case "number":
    case "range":
      if (typeof min !== "undefined") {
        extraRegisterOptions.min = min;
      }
      if (typeof max !== "undefined") {
        extraRegisterOptions.max = max;
      }
      if (valueAsType === true) {
        extraRegisterOptions.valueAsNumber = true;
      }
      break;
    case "date":
      if (valueAsType === true) {
        extraRegisterOptions.valueAsDate = true;
      }
      break;
    default:
      extraRegisterOptions.value = value;
      break;
  }

  return (
    <>
      <TextBox
        {...register(name, { ...extraRegisterOptions, required, disabled })}
        type={type}
        placeholder={placeholder}
        {...props}
        className={className}
        wrapperClassName={wrapperClassName}
        labelClassName={labelClassName}
      >
        {children}
      </TextBox>
      {ErrorComponent ? <ErrorComponent isDirty={isDirty} invalid={invalid} errorMessage={error?.message || null} /> : null}
    </>
  );
};

type ContextTextBoxProps = React.ComponentProps<typeof ContextTextBox>;

export type { ContextTextBoxProps };

export default ContextTextBox;

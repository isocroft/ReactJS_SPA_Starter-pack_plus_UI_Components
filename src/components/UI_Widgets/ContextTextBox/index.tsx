import React, { FC, useState, useEffect } from "react";
import { useFormContext, FieldValues } from "react-hook-form";
import TextBox from "../TextBox";

import type { TextBoxProps } from "../TextBox";

const ContextTextBox: TextBoxProps & { ErrorComponent?: React.FunctionComponent<{ isDirty: boolean, invalid: boolean, errorMessage: string | null }> } = <F extends FieldValues>({
  name,
  type,
  placeholder,
  children,
  className,
  wrapperClassName,
  labelClassName,
  ErrorComponent,
  ...props
}) => {
  const { register, unregister, getFieldState, formState, resetField } = useFormContext<F>();

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

  return (
    <>
      <TextBox
        {...register(name, props)}
        type={type}
        placeholder={placeholder}
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

import React, { FC, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import RadioBox from "../CheckBox";

import type { CheckBoxProps } from "../CheckBox";

const ContextCheckBox: CheckBoxProps & { ErrorComponent?: React.FunctionComponent<{ isDirty: boolean, invalid: boolean, errorMessage: string | null }> } = ({
  name,
  children,
  className,
  wrapperClassName,
  labelClassName,
  checkIconSize,
  checkIconFillColor,
  ErrorComponent,
  ...props
}) => {
  const { register, unregister, getFieldState, formState, resetField } = useFormContext();

  const { isDirty, invalid, error } = getFieldState(name, formState)
  const [timerId] = useState<ReturnType<typeof setTimeout>>(() =>
    setTimeout(() => {
      if (!props.value && !props.defaultCheck) {
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
      <CheckBox
        {...register(name)}
        {...props}
        className={className}
        wrapperClassName={wrapperClassName}
        labelClassName={labelClassName}
        radioIconSize={radioIconSize}
        radioIconStrokeColor={radioIconStrokeColor}
      >
        {children}
      </CheckBox>
      {ErrorComponent ? <ErrorComponent isDirty={isDirty} invalid={invalid} errorMessage={error?.message || null} /> : null}
    </>
  );
};

type ContextCheckBoxProps = React.ComponentProps<typeof ContextCheckBox>;

export type { ContextCheckBoxProps };

export default ContextCheckBox;

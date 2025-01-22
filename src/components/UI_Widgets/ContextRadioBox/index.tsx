import React, { FC, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import RadioBox from "../RadioBox";

import type { RadioBoxProps } from "../RadioBox";

const ContextRadioBox: FC<RadioBoxProps & { ErrorComponent?: React.FunctionComponent<{ isDirty: boolean, invalid: boolean, errorMessage: string | null }> }> = ({
  name,
  children,
  className,
  wrapperClassName,
  tabIndex = 0,
  displayStyle,
  labelClassName,
  radioIconSize,
  radioIconStrokeColor,
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
      <RadioBox
        {...register(name)}
        {...props}
        className={className}
        displayStyle={displayStyle}
        tabIndex={tabIndex}
        wrapperClassName={wrapperClassName}
        labelClassName={labelClassName}
        radioIconSize={radioIconSize}
        radioIconStrokeColor={radioIconStrokeColor}
      >
        {children}
      </RadioBox>
      {ErrorComponent ? <ErrorComponent isDirty={isDirty} invalid={invalid} errorMessage={error?.message || null} /> : null}
    </>
  );
};

type ContextRadioBoxProps = React.ComponentProps<typeof ContextRadioBox>;

export type { ContextRadioBoxProps };

export default ContextRadioBox;

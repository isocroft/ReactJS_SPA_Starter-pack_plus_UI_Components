import React, { FC, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import SelectBox from "../SelectBox";

import type { SelectBoxProps } from "../SelectBox";

const ContextSelectBox: Omit<SelectBoxProps, "ref" | "onBlur" | "onChange"> & { ErrorComponent?: React.FunctionComponent<{ isDirty: boolean, invalid: boolean, errorMessage: string | null }> } = ({
  name,
  children,
  className,
  wrapperClassName,
  labelPosition,
  valueSync,
  renderOptions,
  labelClassName,
  chevronSize,
  chevronOpacity,
  widthFillAvailable,
  ErrorComponent,
  ...props
}) => {
  const { register, unregister, getFieldState, formState } = useFormContext();
  const { isDirty, invalid, error } = getFieldState(name, formState);
  const { ref, onBlur, onChange, name } = register(name, { required: props.required, disabled: props.disabled })

  useEffect(() => {
    return () => {
      unregister(name);
    }
  }, [name]);

  return (
    <>
      <SelectBox
        ref={ref}
        onBlur={onBlur}
        onChange={onChange}
        name={name}
        {...props}
        className={className}
        wrapperClassName={wrapperClassName}
        valueSync={valueSync}
        renderOptions={renderOptions}
        labelClassName={labelClassName}
        chevronSize={chevronIconSize}
        chevronOpacity={chevronIconFillColor}
        widthFillAvailable={widthFillAvailable}
      >
        {children}
      </SelectBox>
      {ErrorComponent ? <ErrorComponent isDirty={isDirty} invalid={invalid} errorMessage={error?.message || null} /> : null}
    </>
  );
};

type ContextSelectBoxProps = React.ComponentProps<typeof ContextSelectBox>;

export type { ContextSelectBoxProps };

export default ContextSelectBox;

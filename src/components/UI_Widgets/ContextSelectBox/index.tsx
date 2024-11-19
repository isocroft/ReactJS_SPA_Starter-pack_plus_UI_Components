import React, { FC, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import SelectBox from "../SelectBox";

import type { SelectBoxProps } from "../SelectBox";

const ContextSelectBox: SelectBoxProps & { ErrorComponent?: React.FunctionComponent<{ isDirty: boolean, invalid: boolean, errorMessage: string | null }> } = ({
  name,
  children,
  className,
  wrapperClassName,
  labelClassName,
  chevronIconSize,
  chevronIconFillColor,
  ErrorComponent,
  ...props
}) => {
  const { register, unregister, getFieldState, formState } = useFormContext();
  const { isDirty, invalid, error } = getFieldState(name, formState)

  useEffect(() => {
    return () => {
      unregister(name);
    }
  }, [name]);

  return (
    <>
      <SelectBox
        {...register(name)}
        {...props}
        className={className}
        wrapperClassName={wrapperClassName}
        labelClassName={labelClassName}
        chevronIconSize={chevronIconSize}
        chevronIconFillColor={chevronIconFillColor}
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

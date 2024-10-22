import React, { FC, useState, useEffect } from "react";
import { useFormContext, FieldValues } from "react-hook-form";
import BasicTextBox from "../BasicTextBox";

import type { BasicTextBoxProps } from "../BasicTextBox";

const ContextTexBox: BasicTextBoxProps = <F extends FieldValues>({
  name,
  type,
  placeholder,
  children,
  className,
  wrapperClassName,
  labelClassName,
  hidePlaceholder,
  ...props
}) => {
  const { register, unregister, formState, resetField } = useFormContext<F>();

  const { isDirty, errors } = getFieldState(name, formState)
  const [timerId] = useState<ReturnType<typeof setTimeout>>(() =>
    setTimeout(() => {
      if (!props.value && !props.defaultValue) {
        resetField(name, { keepTouched: true })
      }
    }, 0);
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
    <BasicTextBox
      {...register(name, props)}
      type={type}
      placeholder={placeholder}
      hidePlaceholder={hidePlaceholder}
      className={className}
      wrapperClassName={wrapperClassName}
      labelClassName={labelClassName}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return null;
        }

        return React.cloneElement(child, {
          isDirty,
          errors
        });
      })}
    </BasicTextBox>
  );
};

type ContextTextBoxProps = React.ComponentProps<typeof ContextTextBox>;

export type { ContextTextBoxProps };

export default ContextTextBox;

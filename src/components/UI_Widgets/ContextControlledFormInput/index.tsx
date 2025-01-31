import React, { FC, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";

import type { FieldValues, UseFormProps } from "react-hook-form";

/*
const [timerId] = useState<ReturnType<typeof setTimeout>>(() =>
    setTimeout(() => {
      if (!props.value && !props.defaultValue) {
        resetField(props.name, { keepTouched: true })
      }
    }, 0);
  );
*/

type ContextControlledFormInputProps = React.ComponentProps<typeof Controller> & {
  wrapperClassName?: string;
  children?: () => JSX.Element;
}

const ContextControlledFormInput: ContextControlledFormInputProps = <F extends FieldValues>({
  wrapperClassName = "",
  children,
  ...props
}) => {
  const { control, formState } = useFormContext<F>();
  let { isDirty, invalid, error } = getFieldState(props.name, formState)

  useEffect(() => {
    const fieldState = getFieldState(props.name, formState);
    invalid = fieldState.invalid;
    error = fieldState.error;
  }, [isDirty]);

  return (
    <div className={wrapperClassName}>
        <Controller control={control} {...props}>
          {children}
        </Controller>
    </div>
  );
};

export type { ContextControlledFormInputProps };

export default ContextControlledFormInput;

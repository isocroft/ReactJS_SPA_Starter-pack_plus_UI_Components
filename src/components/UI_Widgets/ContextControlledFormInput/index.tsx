import React, { FC, useState, useEffect } from "react";
import { useFormContext, Controller, FieldValues, UseFormProps } from "react-hook-form";

type ContextControlledFormInputProps = React.ComponentProps<typeof Controller> & {
  wrapperClassName?: string;
  children?: () => 
}

const ContextControlledFormInput: ContextControlledFormInputProps = <F extends FieldValues>({
  wrapperClassName,
  ...props
}) => {
  const { control, formState, resetField } = useFormContext<F>();

  const { isDirty, touchedFields, errors } = getFieldState(props.name, formState)
  const [timerId] = useState<ReturnType<typeof setTimeout>>(() =>
    setTimeout(() => {
      if (!props.value && !props.defaultValue) {
        resetField(props.name, { keepTouched: true })
      }
    }, 0);
  );

  useEffect(() => {
    return () => {
      if (typeof timerId === "number") {
        clearTimeout(timerId)
      }
    }
  }, [timerId]);

  return (
    <div className={wrapperClassName}>
        <Controller control={control} {...props} />
    </div>
  );
};

export type { ContextControlledFormInputProps };

export default ContextControlledFormInput;

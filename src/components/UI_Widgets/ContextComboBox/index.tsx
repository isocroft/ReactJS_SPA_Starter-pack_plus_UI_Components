import React, { FC } from "react";
import { useFormContext } from "react-hook-form";
import ComboBox from "../ComboBox";

import type { ComboBoxProps, ComboBoxItem } from "../ComboBox";

const ContextComboBox: FC<Omit<ComboBoxProps, "onChange"> & { required: boolean, disabled: boolean, ErrorComponent?: React.FunctionComponent<{ isDirty: boolean, invalid: boolean, errorMessage: string | null }> }> = ({
  children,
  name,
  required,
  disabled,
  ErrorComponent,
  ...props
}) => {
  const { register, getFieldState, formState, setValue } = useFormContext();

  const { isDirty, invalid, error } = getFieldState(name, formState)
  const { name } = register(name, { required, disabled, shouldUnregister: true });

  return (
    <>
      <ComboBox
        name={name}
        {...props}
        onChange({ text, value }) => {
          setValue(name, !value ? text : value, { shouldValidate: true, shouldTouch: true, shouldDirty: true })
        }
      >
        {children}
      </ComboBox>
      {ErrorComponent ? <ErrorComponent isDirty={isDirty} invalid={invalid} errorMessage={error?.message || null} /> : null}
    </>
  );
}

type ContextComboBoxProps = React.ComponentProps<typeof ContextComboBox>;

export type { ContextComboBoxProps, ComboBoxItem };

export { ComboBox };

export default ContextComboBox;

import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import TextBox from "../TextBox";

import type { TextBoxProps } from "../TextBox";

/*
const [timerId] = useState<ReturnType<typeof setTimeout>>(() =>
    setTimeout(() => {
      if (!value && !props.defaultValue) {
        resetField(name, { keepTouched: true });
      }
    }, 0)
  );
*/

const ContextTextBox = ({
  name = "",
  type = "text",
  placeholder,
  children,
  className = "",
  disabled,
  required,
  min,
  max,
  value,
  valueAsType = false,
  wrapperClassName = "",
  labelClassName = "",
  ErrorComponent,
  ...props
}: Omit<TextBoxProps, "onChange" | "onBlur"> & {
  valueAsType?: boolean;
  ErrorComponent?: React.FunctionComponent<{
    isDirty: boolean;
    invalid: boolean;
    errorMessage: string | null;
  }>;
}) => {
  const { register, getFieldState, formState } = useFormContext();

  let { isDirty, invalid, error } = getFieldState(name, formState);

  const extraRegisterOptions: Record<string, unknown> = {};

  useEffect(() => {
    const fieldState = getFieldState(name, formState);
    invalid = fieldState.invalid;
    error = fieldState.error;
  }, [isDirty]);

  /* @NOTE: `maxLength` doesn't work as an option for `require(name, ...)` */
  /* @CHECK: https://github.com/react-hook-form/documentation/issues/1043 */
  switch (type) {
    case "email":
      extraRegisterOptions.validate = (data: string) => {
        const hasAtSymbol = /^(?:[^@]+)(?=\@)/.test(data);
        const hasTopLevelDomain = /\.[a-z]{2,4}$/.test(data);
        return hasAtSymbol && hasTopLevelDomain;
      };
      break;
    case "number":
    case "range":
      if (typeof min !== "undefined") {
        extraRegisterOptions.min = min;
      }
      if (typeof max !== "undefined") {
        extraRegisterOptions.max = max;
      }
      if (valueAsType === true && type === "number") {
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

  const { onChange, onBlur, ref } = register(name, {
    ...extraRegisterOptions,
    required,
    disabled,
    shouldUnregister: true,
  });

  return (
    <>
      <TextBox
        {...props}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        aria-invalid={invalid ? "true" : "false"}
        ref={(node?: HTMLInputElement | null) => ref(node)}
        type={type}
        placeholder={placeholder}
        className={className}
        wrapperClassName={wrapperClassName}
        labelClassName={labelClassName}
      >
        {children}
      </TextBox>
      {ErrorComponent ? (
        <ErrorComponent
          isDirty={isDirty}
          invalid={invalid}
          errorMessage={`${error?.type}: ${error?.message || ""}` || null}
        />
      ) : null}
    </>
  );
};

type ContextTextBoxProps = React.ComponentProps<typeof ContextTextBox>;

export type { ContextTextBoxProps };

export default ContextTextBox;

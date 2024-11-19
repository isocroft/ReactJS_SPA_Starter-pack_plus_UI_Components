import React from "react";
import { useFormContext, useFormState } from "react-hook-form";

import Button from "../Button";

import type { ButtonProps } from "../Button";

const ContextSubmitButton: Omit<ButtonProps, "disabled" | "type"> = ({
  children,
  className
  disabled,
  ...props
}) => {
  const { control } = useFormContext();
  const { isValid, isSubmitting } = useFormState({ control });

  return (
      <Button
        {...props}
        type={"submit"}
        disabled={!isValid || isSubmitting}
        className={className}
      >
        {children}
      </Button>
  );
};

type ContextSubmitButtonProps = React.ComponentProps<typeof ContextSubmitButton>;

export type { ContextSubmitButtonProps };

export default ContextSubmitButton;

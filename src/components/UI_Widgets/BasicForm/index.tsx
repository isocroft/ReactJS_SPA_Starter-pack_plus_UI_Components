import React, { FC } from "react";

const BasicForm: FC<React.ComponentPropsWithRef<"form">> = ({
  onSubmit,
  children,
  ...props
}) => {
  return (
    <form {...props} onSubmit={onSubmit}>
      {children}
    </form>
  );
};

type BasicFormProps = React.ComponentProps<typeof BasicForm>;

export type { BasicFormProps };

export default BasicForm;

import React, { FC } from "react";

const Button: FC<React.ComponentPropsWithRef<"button">> = ({
  id,
  name,
  tabIndex,
  children,
  ...props
}) => {
  return (
    <button id={id} name={name} tabIndex={tabIndex || 0} {...props}>
      {children}
    </button>
  );
};

type ButtonProps = React.ComponentProps<typeof Button>;

export type { ButtonProps };

export default Button;

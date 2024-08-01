import React, { FC } from "react";

const Link: FC<React.ComponentPropsWithRef<"a">> = ({
  id,
  tabIndex,
  children,
  ...props
}) => {
  return (
    <a id={id} tabIndex={tabIndex || 0} {...props}>
      {children}
    </a>
  );
};

type LinkProps = React.ComponentProps<typeof Link>;

export type { LinkProps };

export default Link;

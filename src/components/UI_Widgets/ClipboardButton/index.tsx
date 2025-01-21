import Button from "../Button";
import type { ButtonProps } from "../Button";

import {
  useUICommands,
  COPY_COMMAND
} from "react-busser";

export function ClipboardButton({
  className,
  children,
  textToCopy,
  ...props
}: Omit<ButtonProps, "onClick" | "type"> & {
  textToCopy: string;
}) {
  const commands = useUICommands();
  return (
    <Button
      type="button"
      data-clipboard-trigger="active"
      onClick={() => {
        if (typeof textToCopy === "string" && textToCopy.length > 0) {
          commands.hub.copy(COPY_COMMAND, textToCopy);
        }
      }}
      {...props}
      className={className}
    >
      {children}
    </Button>
  );
}

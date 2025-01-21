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
}: Omit<ButtonProps, "onClick" | "type" | "disabled"> & {
  textToCopy: string;
}) {
  const commands = useUICommands();
  const canCopy = typeof textToCopy === "string" && textToCopy.length > 0;
  return (
    <Button
      type="button"
      data-clipboard-trigger="active"
      onClick={() => {
        if (canCopy) {
          commands.hub.copy(COPY_COMMAND, textToCopy);
        }
      }}
      {...props}
      className={className}
      disabled={!canCopy}
    >
      {children}
    </Button>
  );
}

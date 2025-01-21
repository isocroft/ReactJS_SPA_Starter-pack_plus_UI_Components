import React from "react";
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
      onClick={(event: React.MouseEvent<HTMLButtonElement> & { target: HTMLButtonElement, currentTarget: HTMLButtonElement }) => {
        if (canCopy) {
          const button = event.currentTarget!;
          commands.hub.copy(COPY_COMMAND, textToCopy).then((isTriggered) => {
            if (isTriggered) {
              return;
            }

            const event = new Event("copy", {
              bubbles: true,
              cancelable: true,
            });
            button.dispatchEvent(event);
          });
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

type ClipboardButtonProps = React.ComponentProps<typeof ClipboardButton>;

export type { ClipboardButtonProps };

export default ClipboardButton;

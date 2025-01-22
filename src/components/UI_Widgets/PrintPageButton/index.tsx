import React from "react";
import Button from "../Button";
import type { ButtonProps } from "../Button";

import {
  useUICommands,
  PRINT_COMMAND
} from "react-busser";

export function PrintPageButton({
  className,
  children,
  ...props
}: Omit<ButtonProps, "onClick" | "type">) {
  const commands = useUICommands({
    print: {
      documentTitle: document.title,
			onBeforePrint: () => {
        const event = new Event(
          "beforeprintstart",
          { bubbles: true }
        );
        window.disptachEvent(event);
      },
			onAfterPrint: () => {
        const event = new Event(
          "afterprintend",
          { bubbles: true }
        );
        window.disptachEvent(event);
      },
			onPrintError: () => {
        const event = new Event(
          "printingerrored",
          { bubbles: true }
        );
        window.disptachEvent(event);
      },
			nowPrinting: () => {
        const event = new Event(
          "printingstarted",
          { bubbles: true }
        );
        window.disptachEvent(event)
      }
    }
  });
  
  return (
    <Button
      type="button"
      data-printer-object="trigger"
      onClick={() => {
        commands.hub.execute(PRINT_COMMAND)
      }}
      {...props}
      className={className}
    >
      {children}
    </Button>
  );
}

type PrintPageButtonProps = React.ComponentProps<typeof PrintPageButton>;

export type { PrintPageButtonProps };

export default PrintPageButton;

import React, { useRef, useState } from "react";

import InputBox from "../InputBox";
import ClipboardButton from "../ClipboardButton";

import type { InputBoxProps } from "../InputBox";
import type { ClipboardButtonProps } from "../ClipboardButton";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";

const useCurrentValue = (defaultValue: string) => {
  const [value, setValue] = useState<string>(defaultValue);
  const prevDefaultValue = useRef<string>(defaultValue);

  if (defaultValue !== prevDefaultValue.current) {
    prevDefaultValue.current = value;
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }) => {
    const currentValue = event.target.value;
    setValue((prevValue) => {
      prevDefaultValue.current = prevValue;
      if (prevValue === currentValue) {
        return prevValue;
      }
      return currentValue;
    });
  };

  return [value, handleInputChange] as const;
};

const ClipBoardInput = ({ defaultValue = "", ...props }: Omit<InputBoxProps, "onChange" | "type" | "children">) => {
  return (
    <InputBox
      {...props}
      type={"text"}
      defaultValue={defaultValue}
      readonly={defaultValue.length > 0}
    />
  );
};

const ClipDataBox = ({ defaultValue, children, ...props }: React.ComponentProps<"div"> & { defaultValue: string }) => {
  const [value] = useCurrentValue(defaultValue);
  const renderChildren = ($children: React.ReactNode) => {
    const childrenProps = React.Children.map($children, (child) => {
      switch (true) {
        case React.isValidElement(child) && isSubChild(child, "ClipInput"):
          return React.cloneElement(
            child as React.ReactElement<
              Omit<InputBoxProps, "onChange">
            >,
            {
              defaultValue: value
            }
          );
          break;
        case React.isValidElement(child) && isSubChild(child, "ClipButton"):
          return React.cloneElement(
            child as React.ReactElement<
              ClipboardButtonProps
            >,
            {
              textToCopy: value
            }
          );
          break;
        default:
          return null
          break;
      }
    });
    return childrenProps;
  };

  return (
    <div {...props}>
      {hasChildren(children, 0) ? null : renderChildren(children)}
    </div>
  );
};

/*
  import { Copy } from "lucide-react";

  <ClipDataBox defaultValue={"Hallo!"}>
    <ClipDataBox.ClipInput />
    <ClipDataBox.ClipButton>
      <Copy size={14} />
    </ClipDataBox.ClipButton>
  </ClipDataBox>

*/

ClipDataBox.ClipInput = ClipBoardInput;
ClipDataBox.ClipButton = ClipboardButton;

type ClipDataBoxProps = React.ComponentProps<typeof ClipDataBox>;

export type { ClipDataBoxProps };

export default ClipDataBox;

import React, { FC, useRef, useState, useEffect } from "react";

import InputBox from "../InputBox";
import ClipBoardButton from "../ClipboardButton";

import type { InputBoxProps } from "../InputBox";
import type { ClipboardButtonProps } from "../ClipboardButton";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";

const useCurrentValue = (defaultValue: string) => {
  const [value, setValue] = useState<string>(defaultValue);
  const prevDefaultValue = useRef<string>(defaultValue);

  if (defaultValue !== prevDefaultValue.current) {
    prevDefaultValue.current = value;
  }

  const handleInputChange = (e) => {
    const currentValue = e.target.value;
    setValue((prevValue) => {
      prevDefaultValue.current = prevValue;
      if (prevValue === currentValue) {
        return prevValue;
      }
      return currentValue;
    });
  };

  return [value, handleInputChange];
};

const ClipBoardInput = ({ ...props }: Omit<InputBoxProps, "onChange">) => {
  return (
    <InputBox
      {...props}
    />
  );
};

const ClipDataBox = ({ defaultValue, children, ...props }: React.ComponentProps<"div"> & { defaultValue: string }) => {
  const [value] = useCurrentValue(defaultValue);
  const childrenProps = React.Children.map(children, (child) => {
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
      case React.isValidElement(child) && isSubChild(child, "Option"):
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

  return (
    <div {...props}>
      {childrenProps}
    </div>
  );
};

ClipDataBox.ClipInput = ClipBoardInput;
ClipDataBox.ClipButton = ClipBoardButton;

type ClipDataBoxProps = React.ComponentProps<typeof ClipDataBox>;

export type { ClipDataBoxProps };

export default ClipDataBox;

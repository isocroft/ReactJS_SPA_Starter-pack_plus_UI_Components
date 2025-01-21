import React, { FC, useRef, useState, useEffect } from "react";

import InputBox from "../InputBox";
import ClipBoardButton from "../ClipboardButton";

import type { InputBoxProps } from "../InputBox";
import type { ClipboardButtonnProps } from "../ClipboardButton";

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
  return (
    <div {...props}>
      {children}
    </div>
  );
};

ClipDataBox.ClipInput = ClipBoardInput;
ClipDataBox.ClipButton = ClipBoardButton;

type ClipDataBoxProps = React.ComponentProps<typeof ClipDataBox>;

export type { ClipDataBoxProps };

export default ClipDataBox;

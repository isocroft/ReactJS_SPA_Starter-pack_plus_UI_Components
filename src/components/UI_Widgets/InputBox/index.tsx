import React, { FC, Ref, useEffect, useRef } from "react";

const InputBox: FC<React.ComponentProps<"input">> = React.forwardRef(({
  id,
  name,
  type = "text",
  src,
  size,
  onChange,
  children,
  className,
  defaultValue = "",
  valueSync = false,
  tabIndex = 0,
  ...props
}, ref: Ref<HTMLInputElement>) => {
  const anyValue = (
    defaultValue !== "" ? defaultValue : props.value
  ) as string;
  const textBoxRef = useRef<(HTMLInputElement & HTMLTextAreaElement) | null>(null);
  
});

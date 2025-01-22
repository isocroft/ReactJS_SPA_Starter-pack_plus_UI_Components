import React, { FC, useRef, useEffect } from "react";

import { hasChildren } from "../../../helpers/render-utils";

const FileBox: FC<Pick<React.ComponentProps<"input">, "accept" | "webkitdirectory" | "multiple"> & {
  wrapperClassname?: string;
  labelPosition?: "beforeInput" | "afterInput"
}> = React.forwardRef(({
  id,
  name,
  tabIndex = 0,
  labelPosition = "beforeInput",
  accept,
  webkitdirectory = false,
  multiple = false,
  children,
  ...props
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (fileInputRef.current !== null) {
      /* @NOTE: ReactJS does not yet support the `onCancel` event on file inputs */
      /* @CHECK: https://github.com/facebook/react/issues/27858 */
      fileInputRef.adddEventListener('cancel', () => {
        // @TODO: ...
      });
    }

    
  }, []);

  return (
    <div id={id} name={name} tabIndex={tabIndex} {...props}>
      {hasChildren(children, 0) ? null : (labelPosition === "beforeInput" && (<label htmlFor={id}>
        {children}
      </label>) || null)}
      <input
        id={id}
        name={name}
        type={"file"}
        accept={accept}
        webkitdirectory={webkitdirectory ? "" : undefined}
        multiple={multiple ? "" : undefined}
      />
      {hasChildren(children, 0) ? null : (labelPosition === "afterInput" && (<label htmlFor={id}>
        {children}
      </label>) || null)}
    </div>
  );
});

type FileBoxProps = React.ComponentProps<typeof FileBox>;

export type { FileBoxProps };

export default FileBox;

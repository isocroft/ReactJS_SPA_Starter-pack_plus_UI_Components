import React, { FC, Ref, useRef, useEffect } from "react";

import { hasChildren } from "../../../helpers/render-utils";

const FileBox: FC<Pick<React.ComponentProps<"input">, "accept" | "webkitdirectory" | "multiple" | "onChange" | "onBlur"> & {
  wrapperClassName?: string;
  labelClassName?: string;
  labelPosition?: "beforeInput" | "afterInput";
}> = React.forwardRef(({
  id,
  name,
  tabIndex = 0,
  wrapperClassName,
  labelClassName,
  labelPosition = "beforeInput",
  accept,
  webkitdirectory = false,
  multiple = false,
  children,
  onChange,
  onBlur,
  className,
  ...props
}, ref: Ref<HTMLInputElement>) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (fileInputRef.current !== null) {
      /* @NOTE: ReactJS does not yet support the `onCancel` event on file inputs */
      /* @CHECK: https://github.com/facebook/react/issues/27858 */
      fileInputRef.adddEventListener('cancel', () => {
        // @TODO: ...
      });
    }

    const styleSheetsOnly = [].slice.call<StyleSheetList, [], StyleSheet[]>(
      window.document.styleSheets
    ).filter(
      (sheet) => {
        if (sheet.ownerNode) {
          return sheet.ownerNode.nodeName === "STYLE";
        }
        return false;
    }).map(
      (sheet) => {
        if (sheet.ownerNode
          && sheet.ownerNode instanceof Element) {
          return sheet.ownerNode.id;
        }
        return "";
    }).filter(
      (id) => id !== ""
    );

    if (styleSheetsOnly.length > 0
      && styleSheetsOnly.includes("react-busser-headless-ui_file")) {
      return;
    }

    const fileStyle = window.document.createElement('style');
    fileStyle.id = "react-busser-headless-ui_file";

    fileStyle.innerHTML = `
      .file_wrapper-box {
        position: static;
        display: inline-block; /* shrink-to-fit trigger */
        min-height: 0;
        min-width: fit-content;
      }

      .file-updated-input {
      
      }
    `;  
    window.document.head.appendChild(fileStyle);  
  
    return () => {  
      window.document.head.removeChild(fileStyle);  
    };  
  }, []);

  return (
    <div id={id} name={name} tabIndex={tabIndex} {...props} className={`file_wrapper-box ${wrapperClassName}`}>
      {hasChildren(children, 0) ? null : (labelPosition === "beforeInput" && (<label htmlFor={id} className={labelClassName}>
        {children}
      </label>) || null)}
      <input
        id={id}
        name={name}
        type={"file"}
        accept={accept}
        onChange={onChange}
        onBlur={onBlur}
        webkitdirectory={webkitdirectory ? "" : undefined}
        multiple={multiple ? "" : undefined}
        className={`file-updated-input ${className}`}
        ref={(node?: HTMLInputElement) => {
          if (node) {
            fileInputRef.current = node;
          }
          return typeof ref === "function" ? ref(node) : ref;
        }}
      />
      {hasChildren(children, 0) ? null : (labelPosition === "afterInput" && (<label htmlFor={id} className={labelClassName}>
        {children}
      </label>) || null)}
    </div>
  );
});

type FileBoxProps = React.ComponentProps<typeof FileBox>;

export type { FileBoxProps };

export default FileBox;

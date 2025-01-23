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
  className = "",
  ...props
}, ref: Ref<HTMLInputElement>) => {
  const wrapperDivRef = useRef<HTMLDivElement | null>(null);
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
      :root {
        --file-input-content-font-size: 1rem;
      }
      
      .file_wrapper-box {
        position: static;
        display: inline-block; /* shrink-to-fit trigger */
        min-height: 0;
        min-width: fit-content;
      }

      .file-updated-input {
        display: block;
        font-size: 0;
        position: relative;
        z-index: 0;
        clear: both;
      }

      @supports (not selector(::file-selector-button)) and
        (not selector(::-ms-browse)) and (not selector(::-webkit-file-upload-button)) {
        input[type="file"][class*="file-updated-input"]::after {
          margin-left: -20px;
        }
      }
      
      input[type="file"][class*="file-updated-input"]::-ms-browse {
        display: none;
      }
      
      input[type="file"][class*="file-updated-input"]::-webkit-file-upload-button {
        display: none;
      }
      
      input[type="file"][class*="file-updated-input"]::file-selector-button {
        display: none;
      }

      .file-updated-input::after {
        font-size: var(--file-input-content-font-size);
        position: relative;
        z-index: 10;
        display:inline-block;
      }
      
    `;  
    window.document.head.appendChild(fileStyle);  
  
    return () => {  
      window.document.head.removeChild(fileStyle);  
    };  
  }, []);

  useEffect(() => {
    if (wrapperDivRef.current !== null && fileInputRef.current !== null) {
      const $style = window.getComputedStyle(wrapperDivRef.current);
      const style = window.getComputedStyle(fileInputRef.current, '::after');
      if (style['font-size'] !== $style['font-size']) {
        document.documentElement.style.setProperty(
          '--file-input-content-font-size',
          (parseInt(style['font-size']) / 16) + 'rem'
        );
      }
    }
  }, []);

  return (
    <div id={id} name={name} tabIndex={tabIndex} {...props} className={`file_wrapper-box ${wrapperClassName}`} ref={wrapperDivRef}>
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
          } else {
            fileInputRef.current = null;
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

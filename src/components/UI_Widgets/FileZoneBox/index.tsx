import React, { useRef, useCallback, useEffect, createContext, useContext } from "react";
import { useDropzone } from "react-dropzone";

import type { Ref, PropsWithChildren } from "react";
import type { FileWithPath } from "react-dropzone";

import type { ButtonProps } from "../Button";

import Button from "../Button";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";
 
const FileDropZoneContext = createContext({
  ready: false,
  acceptedFiles: [],
  fileRejections: [],
  isDragActive: false,
  isDragAccept: false,
  isDragReject: false,
  open: () => undefined,
  getInputProps: () => ({}),
  getRootProps: ({ ...props }) => ({ ...props }),
});  
 
const FileDropZoneProvider = ({
  children,
  onDrop,
  accept = { "*/*": [] },
  noClick = false,
  disabled = false,
  noKeyboard = false,
  noDrag = false,
  maxFiles = 1,
  validator = (files: FileWithPath[]) => null
}: PropsWithChildren<{
  onDrop<T extends FileWithPath>(acceptedFiles: T[]): void;
  accept?: Record<string, string[]>;
  noClick?: boolean;
  disabled?: boolean;
  noDrag?: boolean;
  noKeyboard?: boolean;
  maxFiles?: number;
  validator?: (files: FileWithPath[]) => Record<"code" | "message", string> | null
}>) => {
  const {
    getRootProps,
    getInputProps,
    open,
    acceptedFiles,
    fileRejections,
    isDragActive,
    isDragAccept,
    isDragReject 
  } = useDropzone({
    onDrop,
    noClick,
    noKeyboard,
    disabled,
    noDrag,
    maxFiles,
    accept,
    validator
  });

 const ready = true;

  return (  
    <FileDropZoneContext.Provider value={{
      getRootProps,
      getInputProps,
      open,
      acceptedFiles,
      fileRejections,
      isDragActive,
      isDragAccept,
      isDragReject,
      ready
    }}>  
      {children}  
    </FileDropZoneContext.Provider>  
  );  
};  

export const useDropZoneContext = () => {
  const context = useContext(DropzoneContext); 
  if (context.ready === false) {
    console.error("react-busser-ui: <FileDropZoneProvider> not set");
    return context;
  }

  return context;
};  


const DragDropPanel = React.forwardRef(({
    children,
    required,
    name,
    disabled,
    onChange,
    onBlur,
    id,
    ...props
  }: Omit<React.ComponentProps<"div">, "onClick"> & Pick<React.ComponentProps<"input">, "required" | "name" | "disabled" | "onChange">,
  ref: Ref<HTMLInputElement>
) => {  
  const { getRootProps, getInputProps } = useDropZoneContext();

  useEffect(() => {
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
      /* @ts-ignore */
      && styleSheetsOnly.includes("react-busser-headless-ui_filezone")) {
      return;
    }

    const fileZoneStyle = window.document.createElement('style');
    fileZoneStyle.id = "react-busser-headless-ui_filezone";

    fileZoneStyle.innerHTML = `
      .file-input_tag {
        opacity: 0;
      }
    `;  
    window.document.head.appendChild(fileZoneStyle);  
  
    return () => {  
      window.document.head.removeChild(fileZoneStyle);  
    };
  }, []);

  return (
    <div {...getRootProps({
      ...props
    })}> 
      <input
        type="file"
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        className={"file-input_tag"}
        ref={ref}
        onChange={onChange}
        onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
          event.stopPropagation();
      }} />
      <input {...getInputProps()} />
      {children}
    </div>  
  );  
});

const DialogButton = ({ ...props }: Omit<ButtonProps, "type" | "onClick">) => {
  const { open } = useDropZoneContext();
  return (
    <Button type="button" onClick={open} {...props}>
      {children}
    </Button>
  );
};


const FileZoneBox = (
  { children, onDrop, disabled, ...props }: {
    onDrop<T extends FileWithPath>(acceptedFiles: T[]): void;
    accept?: Record<string, string[]>;
    noClick?: boolean;
    disabled?: boolean;
    noDrag?: boolean;
    noKeyboard?: boolean;
    maxFiles?: number;
    validator?: (files: FileWithPath[]) => Record<"code" | "message", string> | null
  },
) => {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  
  const $ref = useCallback((node?: HTMLInputElement) => {
    if (node) {
      hiddenInputRef.current = node;
    } else {
      hiddenInputRef.current = null;
    }
  }, []);

  useEffect(() => {
    /* @HINT: `window.DataTransfer` polyfill for `files` property */
    /* @CHECK: https://gist.github.com/saschanaz/293f9c7698776c8f3510aff703209d24 */
    if ('DataTransfer' in window
      && typeof window.DataTransfer === "function") {
      if (new DataTransfer().files) {
        return;
      }
      Object.defineProperty(DataTransfer.prototype, "files", {
        get() {
          return [...this.items]
            .filter(item => item.kind === "file")
            .map(item => item.getAsFile())
        }
      });
    }
  }, []);

  const renderChildren = ($children: React.ReactNode) => {
    const childrenProps = React.Children.map($children, (child) => {
      switch (true) {
        case React.isValidElement(child) && isSubChild(child, "DragDropPanel"):
          return React.cloneElement(
            child as React.ReactElement<Omit<React.ComponentProps<"div">, "onClick"> & Pick<React.ComponentProps<"input">, "ref", "disabled">>,
            {
              ref: (node) => {
                if (typeof $ref === "function") {
                  $ref(node);
                }
                /* @HINT: Call the original ref on the child, if any */
                /* @CHECK: https://github.com/facebook/react/issues/8873#issuecomment-489579878 */
                const { ref } = child;
                if (typeof ref === "function") {
                  ref(node);
                } else if (ref !== null) {
                  ref.current = node;
                }
              },
              disabled
            }
          );
          break;
        default:
          return child;
          break;
      }
    });
    return childrenProps;
  };

  return (
    <>
      <FileDropZoneProvider {...props} disabled={disabled} onDrop={(incomingFiles: FileWithPath[]) => {
        if (hiddenInputRef.current) {
          /* @NOTE: the specific way we need to munge the file into the hidden input */
          /* @CHECK: https://stackoverflow.com/a/68182158/1068446 */
          const dataTransfer = new DataTransfer();
          incomingFiles.forEach((file) => {
            dataTransfer.items.add(file);
          });
          
          window.setTimeout(() => {
            hiddenInputRef.current.files = dataTransfer.files;
            hiddenInputRef.current.dispatchEvent(new Event("input"));
          },0);
  
          return onDrop(incomingFiles);
        }
      }}>
      {hasChildren(children, 0) ? null : renderChildren(children)}
    </FileDropZoneProvider>
  </>
  );
};

FileZoneBox.DragnDropPanel = DragDropPanel;
FileZoneBox.DialogButton = DialogButton;

type FileZoneBoxProps = React.ComponentProps<typeof FileZoneBox>;

export type { FileZoneBoxProps };

export default FileZoneBox;

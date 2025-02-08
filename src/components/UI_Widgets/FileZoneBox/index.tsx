import React, { useRef, useCallback, useEffect, createContext, useContext } from "react";
import { useDropzone } from "react-dropzone";

import type { Ref, PropsWithChildren } from "react";
import type { FileWithPath, FileRejection, FileError, DropEvent, DropzoneRootProps, DropzoneInputProps } from "react-dropzone";

import type { ButtonProps } from "../Button";

import Button from "../Button";

type FileDropZoneContextValue = {
  ready: boolean,
  acceptedFiles: FileWithPath[],
  fileRejections: FileRejection[],
  isFocused: boolean,
  isFileDialogActive: boolean,
  isDragActive: boolean,
  isDragAccept: boolean,
  isDragReject: boolean,
  open: () => void;
  getInputProps<T extends DropzoneInputProps>(props?: T) => T,
  getRootProps<T extends DropzoneRootProps>(props?: T) => T
}
 
const FileDropZoneContext = createContext<FileDropZoneContextValue>({
  ready: false,
  acceptedFiles: [],
  fileRejections: [],
  isFocused: false,
  isFileDialogActive: false,
  isDragActive: false,
  isDragAccept: false,
  isDragReject: false,
  open: () => undefined,
  getInputProps: ({ ...props }) => ({ ...props }),
  getRootProps: ({ ...props }) => ({ ...props }),
});  
 
const FileDropZoneProvider = ({
  children,
  onDrop,
  accept = { "*/*": [] },
  noClick = false,
  disabled = false,
  noKeyboard = false,
  preventDropOnDocument = false,
  noDrag = false,
  maxSize = 1,
  minSize = 1,
  maxFiles = 1,
  validator = (files: FileWithPath[]) => null,
  ...props
}: PropsWithChildren<{
  onDrop<T extends FileWithPath>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent
  ): void;
  accept?: string | Record<string, string[]>;
  noClick?: boolean;
  disabled?: boolean;
  noDrag?: boolean;
  noKeyboard?: boolean;
  maxFiles?: number;
  maxSize?: number;
  minSize?: number;
  preventDropOnDocument?: boolean;
  noDragEventsBubbling?: boolean;
  getFilesFromEvent?: (
    event: DropEvent
  ) => Promise<Array<File | DataTransferItem>>;
  onFileDialogCancel?: () => void;
  onFileDialogOpen?: () => void;
  validator?: <T extends FileWithPath>(file: T) => FileError | FileError[] | null;
  useFsAccessApi?: boolean;
}>) => {
  const {
    getRootProps,
    getInputProps,
    open,
    acceptedFiles,
    fileRejections,
    isDragActive,
    isDragAccept,
    isDragReject,
    isFocused,
    isFileDialogActive
  } = useDropzone({
    onDrop,
    noClick,
    noKeyboard,
    disabled,
    noDrag,
    minSize,
    maxSize,
    maxFiles,
    accept,
    validator,
    preventDropOnDocument,
    ...props
  });

 const ready = true;

  return (  
    <FileDropZoneContext.Provider value={{
      getRootProps,
      getInputProps,
      open,
      acceptedFiles,
      fileRejections,
      isFileDialogActive,
      isFocused,
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

// // All valid HTML tags like 'div' | 'form' | 'a' | ...
// type ValidTags = HTMLElementTagNameMap;

const DragDropInputPanel = React.forwardRef(({
    children,
    required,
    name,
    onChange,
    onBlur,
    onFocus,
    id,
    ...props
  }: Omit<React.ComponentPropsWithoutRef<"div">, "onClick" | "onBlur" | "onFocus"> & Pick<React.ComponentPropsWithoutRef<"input">, "required" | "name" | "onChange" | "onBlur" | "onFocus">,
  ref: Ref<HTMLInputElement>
) => {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const { getRootProps, getInputProps } = useDropZoneContext();

  const $ref = useCallback((node?: HTMLInputElement) => {
    if (node) {
      hiddenInputRef.current = node;
    } else {
      hiddenInputRef.current = null;
    }

    return typeof ref === "function" ? ref(node) : ref;
  }, []);

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

  useEffect(() => {
    const onFileZoneDropAction = (event: Event) => {
      if (hiddenInputRef.current !== null) {
        hiddenInputRef.current.files = event.detail.files;
        hiddenInputRef.current.dispatchEvent(new Event("input"));
      }
    };

    document.addEventListener('filezonedropaction', onFileZoneDropAction, false);

    return () => {
      document.removeEventListener('filezonedropaction', onFileZoneDropAction, false);
    };
  }, []);

  const { disabled, ...inputProps } = getInputProps({
    onChange: (e: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }) => {
      if (hiddenInputRef.current !== null) {
         hiddenInputRef.current.files = e.target.files;
         hiddenInputRef.current.dispatchEvent(new Event("input"));
      }
    }
  });

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
        ref={$ref}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
          event.stopPropagation();
          if (typeof onFocus === "function") {
            onFocus(event);
          }
      }} />
      <input {...inputProps} disabled={disabled} />
      {children}
    </div>  
  );  
});

const FileDialogButton = ({ ...props }: Omit<ButtonProps, "type" | "onClick">) => {
  const { open } = useDropZoneContext();
  return (
    <Button type="button" onClick={open} {...props}>
      {children}
    </Button>
  );
};


const FileZoneBox = (
  { children, onDrop, disabled, ...props }: {
    onDrop<T extends FileWithPath>(
      acceptedFiles: T[],
      fileRejections: FileRejection[],
      event: DropEvent
    ): void;
    accept?: string | Record<string, string[]>;
    noClick?: boolean;
    disabled?: boolean;
    noDrag?: boolean;
    noKeyboard?: boolean;
    maxFiles?: number;
    maxSize?: number;
    minSize?: number;
    preventDropOnDocument?: boolean;
    validator?: (files: FileWithPath[]) => FileError | FileError[] | null
  },
) => {

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
          
          window.setTimeout((dt) => {
           const event = new window.CustomEvent('filezonedropaction', {
             detail: {
               files: dt.files
             },
             bubbles: true,
             cancelable: true
           })
   
            window.document.dispatchEvent(event);
          }, 0, dataTransfer);
  
          return onDrop(incomingFiles);
        }
      }}>
      {children}
    </FileDropZoneProvider>
  </>
  );
};

FileZoneBox.DragnDropInput = DragDropInputPanel;
FileZoneBox.DialogButton = FileDialogButton;

type FileZoneBoxProps = React.ComponentProps<typeof FileZoneBox>;

export type { FileZoneBoxProps };

export default FileZoneBox;

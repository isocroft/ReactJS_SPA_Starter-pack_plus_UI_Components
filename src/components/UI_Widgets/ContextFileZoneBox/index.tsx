import React, {
  useRef,
  useCallback,
  useEffect,
  createContext,
  useContext,
} from "react";
import { useFormContext } from "react-hook-form";
import { useDropzone } from "react-dropzone";

import type { Ref, PropsWithChildren } from "react";
import type {
  FileWithPath,
  FileRejection,
  FileError,
  DropEvent,
  DropzoneRootProps,
  DropzoneInputProps,
  Accept,
} from "react-dropzone";

import type { ButtonProps } from "../Button";

import Button from "../Button";

export type FileDropZoneContextValue = {
  ready: boolean;
  acceptedFiles: readonly FileWithPath[];
  fileRejections: readonly FileRejection[];
  isFocused: boolean;
  isFileDialogActive: boolean;
  isDragActive: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  open: () => void;
  getInputProps<T extends DropzoneInputProps>(props?: T): T;
  getRootProps<T extends DropzoneRootProps>(props?: T): T;
};

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
  accept = {
    "text/*": [".css", ".html", ".htm", ".txt", ".csv"],
    "application/*": [".pdf", ".docx", ".doc", ".json"],
    "image/*": [".png", ".gif", ".jpeg", ".jpg", ".svg"]
  },
  noClick = false,
  disabled = false,
  noKeyboard = false,
  preventDropOnDocument = false,
  noDrag = false,
  multiple = false,
  maxSize = Infinity,
  minSize = 0,
  maxFiles = 0,
  validator = (file: FileWithPath) => null,
  onError = (error: Error) => undefined,
  ...props
}: PropsWithChildren<{
  onDrop<T extends FileWithPath>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent
  ): void;
  accept?: Accept;
  noClick?: boolean;
  disabled?: boolean;
  multiple?: boolean;
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
  validator?: <T extends FileWithPath>(
    file: T
  ) => FileError | FileError[] | null;
  useFsAccessApi?: boolean;
  autoFocus?: boolean;
  onError?: (error: Error) => void;
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
    isFileDialogActive,
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
    ...props,
  });

  const ready = true;

  return (
    <FileDropZoneContext.Provider
      value={{
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
        ready,
      }}
    >
      {children}
    </FileDropZoneContext.Provider>
  );
};

export const useDropZoneContext = () => {
  const context = useContext(FileDropZoneContext);
  if (context.ready === false) {
    console.error("react-busser-ui: <FileDropZoneProvider> not set");
    return context;
  }

  return context;
};

// // All valid HTML tags like 'div' | 'form' | 'a' | ...
// type ValidTags = HTMLElementTagNameMap;

const DragDropInputPanel = ({
  children,
  required,
  name = "",
  onBlur,
  onFocus,
  onChange,
  id,
  requiredErrorMessage,
  ErrorComponent,
  ...props
}: Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onClick" | "onBlur" | "onFocus"
> &
  Pick<
    React.ComponentPropsWithoutRef<"input">,
    "required" | "name" | "onBlur" | "onFocus" | "onChange"
  > & {
    requiredErrorMessage?: string;
    ErrorComponent?: React.FunctionComponent<{
      isDirty: boolean;
      fieldName: string;
      invalid: boolean;
      errorMessage: string | null;
    }>;
  }) => {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const { register, unregister, setValue, getFieldState, formState } =
    useFormContext();

  let { isDirty, invalid, error } = getFieldState(name, formState);

  useEffect(() => {
    const fieldState = getFieldState(name, formState);
    invalid = fieldState.invalid;
    error = fieldState.error;
  }, [isDirty]);

  const { getRootProps, getInputProps } = useDropZoneContext();

  const $ref = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      hiddenInputRef.current = node;
    } else {
      hiddenInputRef.current = null;
    }
  }, []);

  useEffect(() => {
    const styleSheetsOnly = [].slice
      .call<StyleSheetList, [], StyleSheet[]>(window.document.styleSheets)
      .filter((sheet) => {
        if (sheet.ownerNode) {
          return sheet.ownerNode.nodeName === "STYLE";
        }
        return false;
      })
      .map((sheet) => {
        if (sheet.ownerNode && sheet.ownerNode instanceof Element) {
          return sheet.ownerNode.id;
        }
        return "";
      })
      .filter((id) => id !== "");

    if (
      styleSheetsOnly.length > 0 &&
      /* @ts-ignore */
      styleSheetsOnly.includes("react-busser-headless-ui_filezone")
    ) {
      return;
    }

    const fileZoneStyle = window.document.createElement("style");
    fileZoneStyle.id = "react-busser-headless-ui_filezone";

    fileZoneStyle.innerHTML = `
      .file-input_tag {
        opacity: 0;
        font-size: 0;
        width: 0;
        height: 0;
      }
    `;
    window.document.head.appendChild(fileZoneStyle);

    return () => {
      window.document.head.removeChild(fileZoneStyle);
    };
  }, []);

  useEffect(() => {
    const onFileZoneDropAction = (
      event: CustomEvent<{ files: FileList | null }>
    ) => {
      if (
        hiddenInputRef.current !== null &&
        event.detail.files !== null &&
        event.detail.files.length > 0
      ) {
        hiddenInputRef.current.files = event.detail.files;
        hiddenInputRef.current.dispatchEvent(
          new Event("change", { bubbles: true })
        );
      }
    };

    document.addEventListener(
      "filezonedropaction",
      onFileZoneDropAction,
      false
    );

    return () => {
      document.removeEventListener(
        "filezonedropaction",
        onFileZoneDropAction,
        false
      );
    };
  }, []);

  const { disabled, multiple, accept, autoFocus, ...inputProps } =
    getInputProps({
      onChange: (
        e: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }
      ) => {
        if (hiddenInputRef.current !== null) {
          hiddenInputRef.current.files = e.target.files;
          hiddenInputRef.current.dispatchEvent(
            new Event("change", { bubbles: true })
          );
        }
      },
    } as Partial<DropzoneInputProps>);

  const mergedRegisterOptions: Record<string, unknown> = {
    required:
      required === true
        ? requiredErrorMessage || `${name} is required`
        : undefined,
    disabled,
  };

  useEffect(() => {
    register(name, mergedRegisterOptions);
    return () => {
      unregister(name);
    };
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [register, unregister, name]);

  /* @TODO: Add `watch(name)` for files for |append| and |update| modes */
  /* @CHECK: https://github.com/orgs/react-hook-form/discussions/2146#discussioncomment-8910377 */
  return (
    <>
      <div
        {...getRootProps({
          ...props,
        })}
      >
        <input
          type="file"
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          multiple={multiple}
          accept={accept}
          autoFocus={autoFocus}
          className={"file-input_tag"}
          ref={$ref}
          onChange={(
            event: React.ChangeEvent<HTMLInputElement> & {
              target: HTMLInputElement;
            }
          ) => {
            const newFiles = event.target.files;
            setValue(name, newFiles, { shouldValidate: true });

            if (typeof onChange === "function") {
              onChange(event);
            }
          }}
          onBlur={onBlur}
          onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
            event.stopPropagation();
            if (typeof onFocus === "function") {
              onFocus(event);
            }
          }}
        />
        <input
          {...inputProps}
          disabled={disabled}
          multiple={multiple}
          accept={accept}
          autoFocus={autoFocus}
        />
        {children}
      </div>
      {ErrorComponent ? (
        <ErrorComponent
          isDirty={isDirty}
          fieldName={name}
          invalid={invalid}
          errorMessage={error ? `${error.type}: ${error.message}` : null}
        />
      ) : null}
    </>
  );
};

const FileDialogButton = ({
  children,
  ...props
}: Omit<ButtonProps, "type" | "onClick">) => {
  const { open } = useDropZoneContext();
  return (
    <Button type="button" onClick={open} {...props}>
      {children}
    </Button>
  );
};

const ContextFileZoneBox = ({
  children,
  onDrop,
  onRejectionError,
  className = "",
  ...props
}: PropsWithChildren<{
  onDrop?<T extends FileWithPath>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent
  ): void;
  className?: string;
  accept?: Accept;
  noClick?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  noDrag?: boolean;
  noKeyboard?: boolean;
  maxFiles?: number;
  maxSize?: number;
  minSize?: number;
  noDragEventsBubbling?: boolean;
  getFilesFromEvent?: (
    event: DropEvent
  ) => Promise<Array<File | DataTransferItem>>;
  onFileDialogCancel?: () => void;
  onFileDialogOpen?: () => void;
  validator?: <T extends FileWithPath>(
    file: T
  ) => FileError | FileError[] | null;
  useFsAccessApi?: boolean;
  autoFocus?: boolean;
  onRejectionError?: (
    errors: (FileError & { metadata: Record<string, string> })[]
  ) => void;
  onError?: (error: Error) => void;
}>) => {
  useEffect(() => {
    /* @HINT: `window.DataTransfer` polyfill for `files` property */
    /* @CHECK: https://gist.github.com/saschanaz/293f9c7698776c8f3510aff703209d24 */
    if ("DataTransfer" in window && typeof window.DataTransfer === "function") {
      if (new DataTransfer().files) {
        return;
      }
      Object.defineProperty(DataTransfer.prototype, "files", {
        get() {
          return [...this.items]
            .filter((item) => item.kind === "file")
            .map((item) => item.getAsFile());
        },
      });
    }
  }, []);

  return (
    <section className={className} role="group">
      <FileDropZoneProvider
        {...props}
        onDrop={(incomingFiles: FileWithPath[], fileRejections, event) => {
          /* @NOTE: the specific way we need to munge the file into the hidden input */
          /* @CHECK: https://stackoverflow.com/a/68182158/1068446 */
          const dataTransfer = new DataTransfer();
          incomingFiles.forEach((file) => {
            dataTransfer.items.add(file);
          });

          if (incomingFiles.length === 0 && fileRejections.length > 0) {
            if (typeof onRejectionError === "function") {
              onRejectionError(
                fileRejections.flatMap((fileRejection) =>
                  fileRejection.errors.map(
                    (error) =>
                      ({
                        ...error,
                        metadata: {
                          file_name: fileRejection.file.name,
                          file_path: fileRejection.file.path,
                          file_size: `${String(fileRejection.file.size)} bytes`,
                          file_type: fileRejection.file.type,
                        },
                      } as FileError & { metadata: Record<string, string> })
                  )
                )
              );
            } else {
              console.error("FileRejections: ", fileRejections);
            }
            return;
          }

          window.setTimeout(
            (dt: DataTransfer) => {
              const event = new window.CustomEvent("filezonedropaction", {
                detail: {
                  files: dt.files || null,
                },
                bubbles: true,
                cancelable: true,
              });

              window.document.dispatchEvent(event);
            },
            0,
            dataTransfer
          );

          if (typeof onDrop === "function") {
            onDrop(incomingFiles, fileRejections, event);
          }
        }}
      >
        {children}
      </FileDropZoneProvider>
    </section>
  );
};

ContextFileZoneBox.DragnDropInput = DragDropInputPanel;
ContextFileZoneBox.DialogButton = FileDialogButton;

/* 
  
  function FilesPreviewList() {
    const { acceptedFiles } = useDropZoneContext();
    return (
      <ul>
        {acceptedFiles.map((acceptedFile) => {
          return (
            <li key={acceptedFile.relativePath}>
              <img
                alt={acceptedFile.name}
                src={URL.createObjectURL(acceptedFile)}
                onLoad={(
                  e: React.SyntheticEvent<HTMLImageElement, Event> & {
                    target: HTMLImageElement;
                  }
                ) => URL.revokeObjectURL(e.target.src)}
              />
            </li>
          );
        })}
      </ul>
    );
  }
  
  <ContextFileZoneBox
    maxFiles={1}
    accept={{ "image/*": [] }}
    noClick={true}
    noKeyboard={true}
    onError={(error: Error) => {
      console.error("File Zone Error: ", error.message);
    }}
   >
    <div className="">
      <label htmlFor={"afile"}>
        <span>My Filez:</span>
      </label>
      <ContextFileZoneBox.DragnDropInput
        required
        id="afile"
        name="aphile"
      >
        <span>Drop files here...</span>
      </ContextFileZoneBox.DragnDropInput>
      <ContextFileZoneBox.DialogButton>
        Open File Dialog
      </ContextFileZoneBox.DialogButton>
    </div>
    <FilesPreviewList />
  </ContextFileZoneBox>

  */

type ContextFileZoneBoxProps = React.ComponentProps<typeof ContextFileZoneBox>;

export type { ContextFileZoneBoxProps };

export default ContextFileZoneBox;

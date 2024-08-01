import React, { FC } from "react";

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentPropsWithRef<T> & {
    as?: T;
    children: undefined;
  };

const BasicTextBox: FC<
  CustomElementTagProps<"input" | "textarea"> &
    Omit<
      React.ComponentProps<"input">,
      | "type"
      | "ref"
      | "onChange"
      | "onInput"
      | "pattern"
      | "size"
      | "src"
      | "checked"
      | "multiple"
      | "defaultChecked"
      | "onInvalid"
    > &
    Omit<
      React.ComponentProps<"textarea">,
      | "wrap"
      | "cols"
      | "textLength"
      | "rows"
      | "onChange"
      | "onInput"
      | "ref"
      | "onInvalid"
    > & {
      rows?: number;
      cols?: number;
      wrap?: "hard" | "soft" | "off";
      pattern?: string;
      src?: string;
      size?: number;
      onChange?: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void;
      onInput?: () => void;
      ref?: (instance: HTMLInputElement | HTMLTextAreaElement | null) => void;
      type?: "text" | "password" | "number" | "email" | "search";
    } & {
      wrapperClassName?: string;
      hidePlaceholder?: boolean;
      labelClassName?: string;
    }
> = ({
  as: Component = "input",
  id,
  name,
  type = "text",
  rows,
  cols,
  wrap = "off",
  pattern,
  src,
  size,
  ref,
  onChange,
  children,
  wrapperClassName,
  labelClassName,
  hidePlaceholder = false,
  className,
  tabIndex = 0,
  ...props
}) => {
  return (
    <>
      <div className={wrapperClassName}>
        <Component
          rows={
            typeof rows === "number" && Component === "textarea"
              ? rows
              : undefined
          }
          cols={
            typeof cols === "number" && Component === "textarea"
              ? cols
              : undefined
          }
          wrap={
            typeof wrap === "string" && Component === "textarea"
              ? wrap
              : undefined
          }
          type={
            typeof type === "string" && Component === "input" ? type : undefined
          }
          onChange={typeof onChange === "function" ? onChange : undefined}
          pattern={
            typeof pattern === "string" && Component === "input"
              ? pattern
              : undefined
          }
          src={
            typeof src === "string" && Component === "input" ? src : undefined
          }
          size={
            typeof size === "number" && Component === "input" ? size : undefined
          }
          id={id}
          name={name}
          tabIndex={tabIndex}
          className={className}
          {...props}
          ref={ref}
          placeholder={hidePlaceholder ? "" : undefined}
        />
        {hidePlaceholder ? (
          <label htmlFor={name} className={labelClassName}>
            <span tabIndex={-1} className="placeholder-marker">
              {props.placeholder}
            </span>
            {props.required && (
              <span tabIndex={-1} className="required-marker">
                *
              </span>
            )}
          </label>
        ) : null}
      </div>
      {children}
    </>
  );
};

type BasicTextBoxProps = React.ComponentProps<typeof BasicTextBox>;

export type { BasicTextBoxProps };

export default BasicTextBox;

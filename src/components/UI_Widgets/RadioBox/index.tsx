import React, { FC, useCallback, useEffect } from "react";

import { isSubChild } from "../../../helpers/render-utils";

type RadioBoxControlProps = {
  name?;
  value: string | number;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    selectedValue?: string | number
  ) => void;
} & Omit<React.ComponentProps<"input">, "type" | "onChange" | "crossOrigin">;

type ControlIconProp<T extends React.ElementType> = {
  ControlIcon?: T;
};

const Option: FC<
  {
    selected: boolean;
    labelClassName?: string;
    wrapperClassName?: string;
  } & RadioBoxControlProps &
    ControlIconProp<"span">
> = ({
  value,
  selected = false,
  name,
  id,
  wrapperClassName = "",
  labelClassName = "",
  className = "",
  ControlIcon,
  onChange,
  ...props
}) => {
  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        if (typeof onChange === "function") {
          onChange(event, value);
        }
      }
    },
    [value, name]
  );

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
      && styleSheetsOnly.includes("react-busser-headless-ui_radio")) {
      return;
    }

    const radioStyle = window.document.createElement('style');
    radioStyle.id = "react-busser-headless-ui_radio";

    radioStyle.innerHTML = `  
      .radio_hidden-input {
        opacity: 0;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }

      .radio_control-icon-box {
        min-height: 0;
        min-width: fit-content;
        position: relative;
        display: block;
      }
    `;  
    window.document.head.appendChild(radioStyle);  
  
    return () => {  
      window.document.head.removeChild(radioStyle);  
    };  
  }, []);

  return (
    <div className={wrapperClassName}>
      <span
        className={
          "radio_control-icon-box"
        }
      >
        {controlIcon ? (
          <ControlIcon data-toggle={JSON.stringify(selected)} />
        ) : null}
        <input
          id={id}
          tabIndex={0}
          name={name}
          type="radio"
          value={value}
          className={`${className} ${
            controlIcon
              ? "radio_hidden-input"
              : ""
          }`}
          checked={selected}
          {...props}
        />
      </span>
      <label htmlFor={name} className={labelClassName}>
        <span tabIndex={-1} className={"placeholder-marker"}>
          {props.placeholder}
        </span>
        {props.required && (
          <span tabIndex={-1} className="required-marker">
            *
          </span>
        )}
      </label>
    </div>
  );
};

const RadioBox = ({
  as: Component = "div",
  className = "",
  name,
  value,
  onChange,
  children,
  ...props
}: RadioBoxControlProps &
  CustomElementTagProps<"div" | "section"> &
  Omit<React.ComponentProps<"div">, "align">) => {
  let index = 0;

  const childrenProps = React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || !isSubChild("Option")) {
      return null;
    }

    const childValue: number | string = child.props.value
      ? child.props.value
      : index;

    index += 1;

    return React.cloneElement(
      child as React.ReactElement<
        { selected: boolean } & RadioBoxControlProps &
          React.ComponentProps<"div">
      >,
      {
        onChange,
        value: childValue,
        selected: value === childValue,
        name,
      }
    );
  });

  return (
    <Component
      className={`static-:flex[shrink-to-fit]${
        className ? ` ${className}` : ""
      }`}
      {...props}
    >
      {childrenProps}
    </Component>
  );
};

RadioBox.Option = Option;

type RadioBoxProps = React.ComponentProps<typeof RadioBox>;

export type { RadioBoxProps };

export default RadioBox;

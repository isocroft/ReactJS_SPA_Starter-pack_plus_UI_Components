import React, { FC, useCallback, useEffect } from "react";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";
import { CircleIcon } from "./assets/CircleIcon";

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentPropsWithRef<T> & {
    as?: T;
  };

type RadioBoxControlProps = {
  name?;
  value: string | number;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    selectedValue?: string | number,
  ) => void;
  radioIconFillColor?: string;
  radioIconStrokeColor?: string;
  radioIconSize?: number;
} & Omit<React.ComponentProps<"input">, "type" | "onChange" | "crossOrigin">;

const Option: FC<
  {
    selected: boolean;
    labelClassName?: string;
    wrapperClassName?: string;
  } & RadioBoxControlProps
> = ({
  value,
  selected = false,
  name,
  id,
  wrapperClassName = "",
  labelClassName = "",
  className = "",
  radioIconFillColor,
  radioIconStrokeColor,
  radioIconSize,
  onChange,
  children,
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
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [value, name]
  );

  return (
    <div className={wrapperClassName}>
      <span
        className={`
          radio_control-icon-box ${className}
        `}
      >
        <CircleIcon
          size={radioIconSize}
          iconFill={selected ? radioIconFillColor : "transparent"}
          iconStroke={selected ? radioIconStrokeColor : "transparent"}
        />
        <input
          id={id}
          tabIndex={0}
          name={name}
          type="radio"
          value={value}
          className={"radio_hidden-input"}
          {...props}
          onChange={onChangeHandler}
          checked={selected}
        />
      </span>
      <label htmlFor={name} className={labelClassName}>
        {
          hasChildren(children, 1)
            ? React.cloneElement(
                children as React.ReactElement<
                  { required: boolean }
                >,
                {
                  required: props.required
                }
              )
            : null
        }
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
  radioIconFillColor,
  radioIconStrokeColor,
  radioIconSize,
  ...props
}: RadioBoxControlProps &
  CustomElementTagProps<"div" | "section"> &
  Omit<React.ComponentProps<"div">, "align">) => {

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
      .radio_wrapper-box {
        position: static;
        display: inline-block; /* shrink-to-fit trigger */
        min-height: 0;
        min-width: fit-content;
      }

      .radio_hidden-input {
        opacity: 0;
        position: absolute;
        display: inline-block;
        width: 100%;
        height: 100%;
        pointer-events: none;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }

      .radio_control-icon-box {
        min-height: 0;
        min-width: fit-content;
        position: relative;
        display: inline-block;
      }
    `;  
    window.document.head.appendChild(radioStyle);  
  
    return () => {  
      window.document.head.removeChild(radioStyle);  
    };  
  }, []);

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
        radioIconFillColor,
        radioIconStrokeColor,
        radioIconSize,
        name,
      }
    );
  });

  return (
    <Component
      className={`radio_wrapper-box${
        className ? ` ${className}` : ""
      }`}
      {...props}
    >
      {childrenProps}
    </Component>
  );
};

// <RadioBox as="section" name="gender" value={} onChange={(event, value) => {
//   console.log('current value: ', value);
// }} radioIconSize={RadioIcon.IconSizes.BIG}>
//   <RadioBox.Option value="male">
//     <span>Male</span>
//   </RadioBox.Option>
//   <RadioBox.Option value="female">
//     <span>Female</span>
//   </RadioBox.Option>
// </RadioBox>

RadioBox.Option = Option;
RadioBox.IconSizes = {
  TINY: 16,
  MID: 22,
  BIG: 24
};

type RadioBoxProps = React.ComponentProps<typeof RadioBox>;

export type { RadioBoxProps };

export default RadioBox;

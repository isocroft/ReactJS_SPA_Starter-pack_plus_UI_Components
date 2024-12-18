import React, { FC, useRef, useCallback, useEffect } from "react";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";
import { CircleIcon } from "../RadioBox/assets/CircleIcon";

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentPropsWithRef<T> & {
    as?: T;
  };

type RadioBoxListControlProps = {
  radioIconFillColor?: string;
  radioIconStrokeColor?: string;
  radioIconSize?: number;
} & Omit<React.ComponentProps<"input">, "type" | "value" | "placeholder" | "crossOrigin">;

const Option: FC<
  {
    selected?: boolean;
    value?: string;
    labelClassName?: string;
    onChange?: (
      event: React.ChangeEvent<HTMLInputElement>,
      selectedValue: string | number,
    ) => void;
    wrapperClassName?: string;
  } & Omit<RadioBoxListControlProps, "onChange">
> = ({
  value,
  selected = false,
  tabIndex = 0,
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
    [value]
  );

  return (
    <div className={wrapperClassName}>
      <span
        className={`
          radio_control-icon-box ${className}
        `}
      >
        <input
          id={id}
          tabIndex={tabIndex}
          name={name}
          type="radio"
          {...props}
          value={value}
          className={"radio_hidden-input"}
          onChange={onChangeHandler}
          checked={selected}
        />
        {typeof radioIconSize === "number" ? (<CircleIcon
          size={radioIconSize}
          iconFill={selected ? radioIconFillColor : "transparent"}
          iconStroke={radioIconStrokeColor}
        />) : null}
      </span>
      {hasChildren(children, 0) ? null : <label htmlFor={id} className={labelClassName}>
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
      </label>}
    </div>
  );
};

const RadioBoxList = ({
  as: Component = "div",
  className = "",
  name,
  onChange,
  children,
  radioDefaultValue = "",
  radioIconFillColor,
  radioIconStrokeColor,
  radioIconSize,
  ...props
}: Pick<RadioBoxListControlProps, "name" | "disabled" | "required" | "onChange" | "onBlur" | "radioIconSize" | "radioIconStrokeColor" | "radioIconFillColor"> &
  { radioDefaultValue?: string } &
  CustomElementTagProps<"div" | "section"> &
  Omit<React.ComponentProps<"div">, "align">) => {

  const radioValue = useRef<string>(radioDefaultValue);
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
        margin: 0;
        padding: 0;
        border: none;
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
        vertical-align: middle;
      }
    `;  
    window.document.head.appendChild(radioStyle);  
  
    return () => {  
      window.document.head.removeChild(radioStyle);  
    };  
  }, []);

  const childrenProps = React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || !isSubChild(child, "Option")) {
      return null;
    }

    const childValue: string = child.props.value;

    return React.cloneElement(
      child as React.ReactElement<
        {
          selected: boolean,
          value?: string,
          onChange?: (
            event: React.ChangeEvent<HTMLInputElement>,
            selectedValue: string,
          ) => void
        } & Omit<RadioBoxListControlProps, "onChange">
      >,
      {
        onChange: (event, selectedValue) => {
          radioValue.current = selectedValue;
          /* @ts-ignore */
          event.currentValue = selectedValue;
          onChange(event);
        },
        value: childValue,
        selected: radioValue.current === childValue,
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

// const [radioValue, setRadioValue] = useState("male");

// <RadioBoxList as="section" name="gender" radioDefaultValue={"male"} onChange={(event) => {
//   console.log('current value: ', event.currentValue);
//   setRadioValue(event.currentValue);
// }} radioIconSize={RadioIcon.IconSizes.BIG}>
//   <RadioBoxList.Option value="male" id="male">
//     <span>Male</span>
//   </RadioBoxList.Option>
//   <RadioBoxList.Option value="female" id="female">
//     <span>Female</span>
//   </RadioBoxList.Option>
// </RadioBoxList>

RadioBoxList.Option = Option;

export const RadioIcon = {
  'IconSizes': {
    TINY: 16,
    MID: 22,
    BIG: 24
  }
};

type RadioBoxListProps = React.ComponentProps<typeof RadioBoxList>;

export type { RadioBoxListProps };

export default RadioBoxList;

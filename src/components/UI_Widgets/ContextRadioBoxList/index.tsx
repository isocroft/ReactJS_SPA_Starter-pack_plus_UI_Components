import React, { FC, useRef, useCallback, useState, useEffect } from "react";
import type { RadioBoxListProps } from "../RadioBoxList";
import { RadioIcon } from "../RadioBoxList";

import { useFormContext } from "react-hook-form";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";
import { CircleIcon } from "../RadioBox/assets/CircleIcon";

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentPropsWithRef<T> & {
    as?: T;
  };

type ContextRadioBoxListControlProps = {
  radioIconFillColor?: string;
  radioIconStrokeColor?: string;
  radioIconSize?: number;
} & Omit<React.ComponentProps<"input">, "type" | "placeholder" | "crossOrigin">;

const InputOption: FC<
  {
    labelClassName?: string;
    wrapperClassName?: string;
  } & ContextRadioBoxListControlProps
> = React.forwardRef(({
  value,
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
  onBlur,
  required,
  disabled,
  children,
  ...props
}, ref) => {
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
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          {...props}
          value={value}
          className={"radio_hidden-input"}
        />
        {typeof radioIconSize === "number" ? (<CircleIcon
          size={radioIconSize}
          iconFill={"transparent"}
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
});

const ContextRadioBoxList: RadioBoxListProps & { ErrorComponent?: React.FunctionComponent<{ isDirty: boolean, invalid: boolean, errorMessage: string | null }> } = ({
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
}) => {

  const { register, unregister, getFieldState, formState, resetField } = useFormContext();
  const radioValue = useRef<string>(radioDefaultValue);

  const { isDirty, invalid, error } = getFieldState(name, formState)
  const [timerId] = useState<ReturnType<typeof setTimeout>>(() =>
    setTimeout(() => {
      if (!props.value && !props.defaultCheck) {
        resetField(name, { keepTouched: true })
      }
    }, 0)
  );

  useEffect(() => {
    return () => {
      if (typeof timerId === "number") {
        clearTimeout(timerId)
      }
      unregister(name);
    }
  }, [timerId]);

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
      && styleSheetsOnly.includes("react-busser-headless-ui_radio-contextbox")) {
      return;
    }

    const radioStyle = window.document.createElement('style');
    radioStyle.id = "react-busser-headless-ui_radio-contextbox";

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

      .radio_hidden-input:checked + svg rect {
        fill: ${radioIconFillColor};
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
    if (!React.isValidElement(child) || !isSubChild(child, "InputOption")) {
      return null;
    }

    const childValue: string = child.props.value;
    /* @CHECK: https://stackoverflow.com/a/71497701  */
    const { ref, ...rest } = register(name, { required, disabled });

    return React.cloneElement(
      child as React.ReactElement<
        {
          value?: string
        } & ContextRadioBoxListControlProps
      >,
      {
        ...rest,
        value: childValue,
        radioIconFillColor,
        radioIconStrokeColor,
        radioIconSize,
        ref: (input?: HTMLInputElement) => {
          ref(input);
          if (input) {
            radioValue.current = input.value;
          } else {
            radioValue.current = radioDefaultValue;
          }
        }
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
      <>
        {childrenProps}
      </>
      {ErrorComponent ? <ErrorComponent isDirty={isDirty} invalid={invalid} errorMessage={error?.message || null} /> : null}
    </Component>
  );
};


// <ContextRadioBoxList as="section" name="gender" radioDefaultValue={"male"} radioIconSize={RadioIcon.IconSizes.BIG}>
//   <ContextRadioBoxList.Option value="male" id="male">
//     <span>Male</span>
//   </ContextRadioBoxList.Option>
//   <ContextRadioBoxList.Option value="female" id="female">
//     <span>Female</span>
//   </ContextRadioBoxList.Option>
// </ContextRadioBoxList>

ContextRadioBoxList.Option = InputOption;

export { RadioIcon };

type ContextRadioBoxListProps = React.ComponentProps<typeof ContextRadioBoxList>;

export type { ContextRadioBoxListProps };

export default ContextRadioBoxList;

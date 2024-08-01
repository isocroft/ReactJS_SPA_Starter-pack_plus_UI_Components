import React, { FC, useCallback } from "react";

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

  return (
    <div className={wrapperClassName}>
      <span
        className={
          "all:block[shrink-to-fit] display-block block position-relative relative"
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
              ? "opacity-none opacity-0 position-absolute absolute inset-cover inset-0"
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

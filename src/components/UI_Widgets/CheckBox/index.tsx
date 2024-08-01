import React, { FC } from "react";

type ControlIconProp<T extends React.ElementType> = {
  ControlIcon?: T;
};

const CheckBox: FC<
  {
    placeholder?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    children?: React.ReactNode;
  } & React.ComponentPropsWithRef<"input"> &
    Omit<React.ComponentProps<"input">, "type">
> &
  ControlIconProp<"span"> = ({
  id,
  name,
  tabIndex = 0,
  placeholder,
  wrapperClassName,
  labelClassName,
  className,
  ControlIcon,
  ...props
}) => {
  return (
    <>
      <div className={wrapperClassName}>
        <span
          className={
            "all:block[shrink-to-fit] display-block block position-relative relative"
          }
        >
          <input
            id={id}
            name={name}
            type="checkbox"
            tabIndex={tabIndex}
            className={className}
            {...props}
          />
        </span>
        <label htmlFor={name} className={labelClassName}>
          <span tabIndex={-1} className={"placeholder-marker"}>
            {placeholder}
          </span>
          {props.required && (
            <span tabIndex={-1} className="required-marker">
              *
            </span>
          )}
        </label>
      </div>
      {children}
    </>
  );
};

type CheckBoxProps = React.ComponentProps<typeof CheckBox>;

export type { CheckBoxProps };

export default CheckBox;

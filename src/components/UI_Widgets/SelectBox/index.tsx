import React, { FC, Ref } from "react";

import { hasChildren } from "../../../helpers/render-utils";

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentProps<T> & {
    as?: T;
    children: undefined;
  };
/*
type Fn<ARGS extends any[], R> = (...args: ARGS) => R;

const useEventCallback = <A extends any[], R>(fn: Fn<A, R>): Fn<A, R> => {
  const ref = React.useRef<Fn<A, R>>(fn);

  // not sure this I like assigning to a ref during the method call, but React recommends it for certain circumstances:
  // https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents
  // so it's probably OK.
  
  if (ref.current !== fn) {
    ref.current = fn;
  }
  

  const immutableRef = useRef((...args: A) => {
    // perform call on version of the callback from last commited render
    return ref.current(...args);
  }).current;

  return immutableRef;

};

function useEventCallback<A extends any[], R>(fn: Fn<A, R>): Fn<A, R> {
  const ref = React.useRef(fn);
  const _effect = typeof React.useLayoutEffect === "function" ? React.useLayoutEffect : React.useEffect;

  _effect(() => {
    ref.current = fn;
  }, [fn]);

  return React.useCallback(() => {
    const fn = ref.current;
    return fn();
  }, [ref]);
}
*/

const SelectBox: FC<
  {
    placeholder?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    children?: React.ReactNode;
    chevronIconSize?: number;
    chevronIconFillColor?: string;
  } &
   CustomElementTagProps<"select" | "datalist">
  > = React.forwardRef(({
  children,
  wrapperClassName,
  labelClassName,
  className,
  as: Component = "select",
  chevronIconSize,
  chevronIconFillColor,
  ...props
}, ref: Ref<HTMLSelectElement | HTMLDataListElement>) => {
  /*
  const onClick = useEventCallback<NonNullable<ComponentProps<"select">["onClick"]>>((event) => {
    if (typeof props.onClick === "function") {
      props.onClick(e);
    }

    if (e.defaultPrevented) {
      return;
    }

    // @TODO: Do something later...
  })
  */

  return (
    <div className={wrapperClassname}>
      <Component {...props} className={className} ref={ref}>{children}</Component>
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
}

const Option: FC<{
  ComponentProps<"option">
}> = ({ value, children }) => {
  return <option value={value}>{children}</option>
}

const SelectBox = Object.assign(SelectBox, { Option });

type SelectBoxProps = React.ComponentProps<typeof SelectBox>;

export type { SelectBoxProps };

export default SelectBox;

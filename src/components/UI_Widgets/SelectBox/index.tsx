import React, { FC, Ref, ComponentProps } from "react";

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

const SelectBox: FC<ComponentProps<"select" | "datalist">> = React.forwardRef({ children, ...props }, ref: Ref<HTMLSelectElement>) => {
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

  return <select {...props}>{children}</select>
}

const Option: FC<{
  ComponentProps<"option">
}> = ({ value, children }) => {
  return <option value={value}>{children}</option>
}

const SelectBox = Object.assign(SelectBox, { Option });

export default SelectBox;

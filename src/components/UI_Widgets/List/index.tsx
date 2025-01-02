import React, { Ref } from "react";

import { hasChildren } from "../../../helpers/render-utils";

type CustomElementTagNoChildrenProps<T extends React.ElementType> =
  React.ComponentProps<T> & {
    as?: T;
  }

const $List = <D extends string | Record<string, string | number | object>>(
  {
    children,
    data = [],
    listItemClassName = "",
    keyPropName = "id",
    as: Component = "ul",
    DataListItem = "li",
    ...props
  }: Omit<React.ComponentProps<"ol">, "start" | "reversed"> &
    Omit<CustomElementTagNoChildrenProps<"ul" | "ol">, "ref"> & {
      data?: Array<D>;
      keyPropName?: string;
      listItemClassName?: string;
      DataListItem?:
        | React.ElementType
        | React.ComponentType<React.ComponentProps<"li"> & { listitem: D }>;
    },
  ref: Ref<HTMLUListElement & HTMLOListElement>
) => {
  return (
    <Component {...props} role="list" ref={ref}>
      {hasChildren(children, 0) ? data.map((todo, index) => {
        const keyValue =
          typeof todo !== "object"
            ? String(index)
            : ((todo[keyPropName] || String(index)) as React.Key);
        if (typeof DataListItem === "function") {
          return <DataListItem key={keyValue} listitem={todo} data-key-index={String(index)} />;
        }
        return (
          <DataListItem
            className={listItemClassName}
            key={keyValue}
            role="listitem"
          >
            {typeof todo !== "object" ? todo : todo.text}
          </DataListItem>
        );
      }) : children}
    </Component>
  );
};

const List = React.forwardRef($List);

type ListProps = React.ComponentProps<typeof List>;

export type { ListProps }

export default List;

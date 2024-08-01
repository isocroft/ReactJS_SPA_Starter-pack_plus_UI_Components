import React, { FC, useRef, useState, useCallback, useEffect } from "react";
import { useTextFilteredList } from "react-busser";
import pick from "lodash.pick";

import { useMutationObserver } from "../../../hooks";
/* @ts-ignore */
import type { ComboBoxComposite, ComboBoxItem } from "./internal";
import { useComboBoxCore } from "./internal";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";

const generateSeededRandomId = () =>
  "a" + (Math.random() + 1).toString(36).substring(2, 7) + Date.now();

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentPropsWithRef<T> & {
    as?: T;
  };

const Trigger: FC<
  CustomElementTagProps<"input"> &
    Pick<React.ComponentProps<"input">, "onClick"> &
    Omit<React.ComponentProps<"input">, "labels" | "type"> & {
      type?: "button" | "text";
      composite?: ComboBoxComposite;
      onTriggerClick?: () => void;
    }
> = ({
  as: Component = "input",
  children,
  className,
  style,
  type = "button",
  placeholder = "",
  onTriggerClick = () => undefined,
  composite = { selectedIndex: -1, selectedItem: null },
  ...props
}) => {
  const getLabelText = (
    selectedItem: ComboBoxComposite["selectedItem"],
    children: React.ReactNode,
    defaultText?: string
  ) => {
    const noChild = hasChildren(children, 0);

    if (!noChild) {
      if (selectedItem) {
        return selectedItem?.text || "<unknown>";
      }
      return children || defaultText || "Select an item...";
    }

    return selectedItem
      ? selectedItem?.text || "<unknown>"
      : defaultText || "Select an item...";
  };

  return (
    <>
      <Component
        tabIndex={0}
        key={placeholder}
        onClick={() => {
          if (typeof onTriggerClick === "function") {
            onTriggerClick();
          }
        }}
        className={className}
        role={type === "button" ? "button" : "group"}
        style={style}
        {...props}
        type={type}
      >
        {type === "button"
          ? getLabelText(composite.selectedItem, children, placeholder)
          : null}
      </Component>
      {type === "text" ? (
        <span aria-hidden="true" data-trigger="multiselect"></span>
      ) : null}
    </>
  );
};

const ListItem: FC<
  {
    disabled?: boolean;
    selected: boolean;
  } & CustomElementTagProps<"li">
> = ({
  as: Component = "li",
  children,
  className,
  style,
  selected,
  disabled,
  ...props
}) => {
  return (
    <Component
      className={className}
      data-selected={JSON.stringify(selected)}
      style={style}
      role="listitem"
      {...props}
      aria-disabled={disabled}
    >
      {children}
    </Component>
  );
};

const List: FC<
  {
    innerRef?: (node: HTMLOListElement | null) => void;
    items?: ComboBoxItem[];
    isMultiSelect?: boolean;
    composite?: ComboBoxComposite;
    onListItemClick?: (indexPosition?: number) => void;
    render?: (
      item: ComboBoxItem,
      selected: boolean,
      injectedChildNode?: React.ReactNode
    ) => React.ReactElement;
  } & CustomElementTagProps<"ul" | "ol"> &
    Omit<React.ComponentProps<"ol">, "start" | "reversed">
> = ({
  as: Component = "ul",
  children,
  className,
  style,
  render,
  items = [],
  isMultiSelect = false,
  onListItemClick = () => undefined,
  composite = { selectedIndex: -1, selectedItem: null },
  innerRef = null,
  ...props
}) => {
  const setSize = items.length;
  const noChild = hasChildren(children, 0);
  return setSize > 0 ? (
    <>
      <Component
        className={className}
        style={style}
        {...props}
        role="listbox"
        aria-multiselectable={isMultiSelect}
        aria-activedescendant={
          composite.selectedIndex !== -1
            ? items[composite.selectedIndex].id
            : undefined
        }
        ref={innerRef}
      >
        {noChild
          ? items.map((item, index) => {
              const selected = index === composite.selectedIndex;
              return (
                <ListItem
                  id={item.id}
                  key={String((item.id || item.text) + "_" + index)}
                  selected={selected}
                  onClick={() => onListItemClick(index)}
                  className={""}
                  aria-setsize={setSize}
                  aria-posinset={index + 1}
                  aria-selected={
                    selected || isMultiSelect ? selected : undefined
                  }
                >
                  {typeof render === "function"
                    ? render(item, index === composite.selectedIndex)
                    : item.text}
                </ListItem>
              );
            })
          : (React.isValidElement(children) &&
              React.Children.map(children, (child, index) => {
                if (!isSubChild(child, "ListItem")) {
                  return null;
                }

                return React.cloneElement(child, {
                  children:
                    typeof render === "function"
                      ? render(
                          items[index],
                          index === composite.selectedIndex,
                          child.props.children
                        )
                      : items[index].text,
                  selected: index === composite.selectedIndex,
                  onClick: () => onListItemClick(index),
                });
              })) ||
            null}
      </Component>
    </>
  ) : null;
};

const SearchableList: FC<
  {
    searchWrapperClassName?: string;
    innerRef?: (node: HTMLOListElement | null) => void;
    isMultiSelect?: boolean;
    items?: ComboBoxItem[];
    composite?: ComboBoxComposite;
    onListItemClick?: (indexPosition?: number) => void;
    render?: (
      item: ComboBoxItem,
      selected: boolean,
      injectedChildNode?: React.ReactNode
    ) => React.ReactElement;
  } & CustomElementTagProps<"section">
> = ({
  as: Component = "section",
  children,
  className,
  style,
  render,
  searchWrapperClassName,
  items = [],
  isMultiSelect = false,
  onListItemClick = () => undefined,
  composite = { selectedIndex: -1, selectedItem: null },
  innerRef = null,
  ...props
}) => {
  const oneChild = hasChildren(children, 1);
  const [searchInputId] = useState<string>(() => generateSeededRandomId());
  const searchInputName = `search-box__${searchInputId}__${Date.now()}`;
  const [controller, handleChange] = useTextFilteredList(
    {
      text: "",
      list: items,
    },
    {
      filterTaskName: "specific",
    }
  );
  const onSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      return handleChange(event, ["text"]);
    },
    []
  );

  return (
    <section style={style} className={className} {...props} role="group">
      <div className={searchWrapperClassName} key={searchInputId}>
        <input
          type="text"
          tabIndex={0}
          value={controller.text}
          onChange={onSearchChange}
          id={searchInputId}
          name={searchInputName}
          role="searchbox"
          aria-label="reactbusser-combobox_search:rc"
          aria-autocomplete="list"
        />
      </div>
      {(React.isValidElement(children) &&
        oneChild &&
        React.Children.map(children, (child) => {
          if (!isSubChild(child, "List")) {
            return null;
          }

          return React.cloneElement(child, {
            innerRef,
            items: controller.list,
            onListItemClick,
            render,
            isMultiSelect,
            composite,
          });
        })) ||
        null}
    </section>
  );
};

const ComboBox = ({
  as: Component = "div",
  items = [],
  placeholder = "",
  onChange = () => undefined,
  onStateChanged = () => undefined,
  dropdownToggleClassName,
  tabIndex,
  name,
  id,
  className,
  isMultiSelect = false,
  children,
  ...props
}: {
  items: ComboBoxItem[];
  isMultiSelect?: boolean;
  dropdownToggleClassName?: string;
  onStateChanged?: (state: "open" | "closed" | "disabled") => void;
  onChange: (valueItem: ComboBoxComposite["selectedItem"]) => void;
} & Pick<React.ComponentProps<"select">, "placeholder" | "name"> &
  CustomElementTagProps<"div" | "section"> &
  Omit<React.ComponentProps<"div">, "align">) => {
  const renderChildren = (
    $children: React.ReactNode,
    extraChildProps: {
      items: ComboBoxItem[];
      placeholder: string;
      composite: ComboBoxComposite;
      onListItemClick: (indexPosition?: number) => void;
      onTriggerClick: () => void;
      dropdownRef: Map<string, HTMLElement>;
      isMultiSelect: boolean;
    },
    innerRef: (node?: HTMLOListElement) => void
  ) => {
    const oneChild = hasChildren($children, 1);
    const noChild = hasChildren($children, 0);

    if (noChild || oneChild) {
      console.error(
        "[Error]: <ComboBox /> requires no less than 2 valid children; <ComboBox.Trigger /> and (<ComboBox.List /> or <ComboBox.SearchableList />)"
      );
      return null;
    }

    const childrenList = React.Children.toArray($children);

    if (typeof $children === "object") {
      if ($children !== null && Array.isArray(childrenList)) {
        return childrenList.map((child) => {
          if (!React.isValidElement(child) || !("props" in child)) {
            return null;
          }

          switch (true) {
            case isSubChild(child, "Trigger"):
              return React.cloneElement(
                child,
                Object.assign(
                  {},
                  {
                    onClick: extraChildProps.onTriggerClick,
                  },
                  pick(extraChildProps, ["placeholder", "composite"])
                )
              );

            case isSubChild(child, "List"):
            case isSubChild(child, "SearchableList"):
              return React.cloneElement(
                child,
                Object.assign(
                  {},
                  pick(extraChildProps, [
                    "items",
                    "onListItemClick",
                    "isMultiSelect",
                    "composite",
                  ]),
                  {
                    innerRef,
                  }
                )
              );

            default:
              return React.isValidElement(child) ? child : null;
          }
        });
      }
    }

    return null;
  };

  let element: HTMLElement | null = null;

  const comboBoxRef = useRef<HTMLDivElement | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const [comboBoxId] = useState<string>(() => id || generateSeededRandomId());
  const {
    composite,
    toggleOpenState,
    dropdownRef,
    handleKeys,
    setSelectedItem,
  } = useComboBoxCore(
    items,
    comboBoxId,
    "$__dropdown:change:broadcast",
    dropdownToggleClassName
  );

  useEffect(() => {
    if (composite.selectedIndex === -1) {
      return;
    }

    if (composite.selectedItem) {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = composite.selectedItem.value as string;
        onChange(composite.selectedItem);
      }
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [composite.selectedIndex]);

  const innerRef = (node) => {
    if (!node) {
      if (dropdownRef.has(comboBoxId)) {
        dropdownRef.delete(comboBoxId);
      }
    } else {
      element = node;
      if (!dropdownRef.has(comboBoxId)) {
        dropdownRef.set(comboBoxId, node);
      }
    }
  };

  useMutationObserver({ current: element }, (mutations) => {
    mutations.forEach(function (mutation) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const canTriggerStateChangeEvent = mutation.target.className !== "";

        if (!canTriggerStateChangeEvent) {
          return;
        }

        const currentState = mutation.target.classList.has(
          dropdownToggleClassName || "show-list"
        )
          ? "open"
          : "closed";

        if (comboBoxRef.current) {
          comboBoxRef.current.setAttribute(
            "aria-expanded",
            currentState === "open" ? "true" : "false"
          );
        }

        onStateChanged(currentState);
      }
    });
  });

  return (
    <Component
      data-name={name}
      id={id}
      tabIndex={tabIndex}
      onKeyDown={handleKeys}
      className={className}
      {...props}
      role="combobox"
      aria-expanded={false}
      ref={comboBoxRef}
    >
      <>
        <input type="hidden" name={name} value={""} ref={hiddenInputRef} />
        {renderChildren(
          children,
          {
            items,
            placeholder,
            onTriggerClick: toggleOpenState,
            onListItemClick: setSelectedItem,
            composite,
            dropdownRef,
            isMultiSelect,
          },
          innerRef
        )}
      </>
    </Component>
  );
};

ComboBox.Trigger = Trigger;
ComboBox.List = List;
ComboBox.SearchableList = SearchableList;
ComboBox.ListItem = ListItem;

const ComboBoxEvent = {
  DROPDOWN_CHANGE_BROADCAST: "$__dropdown:change:braodcast",
};

export { ComboBox, ComboBoxEvent };

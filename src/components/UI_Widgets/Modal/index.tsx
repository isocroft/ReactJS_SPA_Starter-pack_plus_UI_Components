import React, { FC } from "react";
import ReactDOM from "react-dom";

import { hasChildren, isSubChild } from "../../../helpers/render-utils";

type ModalTriggerProps = {
  close?: () => void;
};

type CustomElementTagProps<T extends React.ElementType> =
  React.ComponentPropsWithRef<T> & {
    as?: T;
  };

const renderChildren = (
  children: React.ReactNode,
  { close, parent = "Modal" }: Required<ModalTriggerProps> & { parent: string }
) => {
  const oneChild = hasChildren(children, 1);
  const topChildren = React.Children.toArray(children);

  if (parent === "Modal") {
    const [parentChild] = topChildren;
    if (
      !oneChild ||
      !React.isValidElement(parentChild) ||
      parentChild?.type === React.Fragment
    ) {
      console.error("[Error]: invalid Modal inner wrapper component found");
      return null;
    }
  }

  if (typeof children === "object") {
    if (children !== null && children !== undefined) {
      if (parent === "Modal") {
        const [parentChild] = topChildren;
        if (
          !React.isValidElement(parentChild) ||
          !("props" in parentChild) ||
          (typeof parentChild.props.children !== "object" &&
            parentChild.props.children !== null) ||
          React.Children.count(parentChild.props.children) !== 3
        ) {
          console.error(
            "[Error]: Modal must have at least 3 valid children; " +
              "<Modal.Header />, <Modal.Body /> and <Modal.Footer />"
          );
          return null;
        }

        return topChildren.map((child) => {
          if (!React.isValidElement(child)) {
            return null;
          }

          const { children, ...childProps } = child.props;
          return (
            <child.type {...childProps}>
              {React.Children.map(child.props.children, (innerChild) => {
                switch (true) {
                  case parent === "Modal" && isSubChild(innerChild, "Header"):
                  case parent === "Modal" && isSubChild(innerChild, "Footer"):
                  case parent === "Modal" && isSubChild(innerChild, "Body"):
                    return React.cloneElement(innerChild, {
                      close: close,
                    });
                    break;
                  default:
                    return null;
                    break;
                }
              })}
            </child.type>
          );
        });
      }

      return React.Children.map(children, ($innerChild) => {
        switch (true) {
          case parent !== "Modal":
            if (
              $innerChild &&
              React.isValidElement<React.ReactNode & { close: () => void }>(
                $innerChild
              )
            ) {
              return React.cloneElement($innerChild, {
                close,
              });
            }
            break;
          default:
            return null;
            break;
        }
      });
    }
  }

  return null;
};

const Header: FC<
  ModalTriggerProps &
    CustomElementTagProps<"header" | "section" | "div"> &
    Omit<React.ComponentProps<"div">, "align">
> = ({
  as: Component = "header",
  close = () => undefined,
  className,
  children,
  ...props
}) => {
  return (
    <Component className={className} {...props}>
      {renderChildren(children, { close, parent: "Header" })}
    </Component>
  );
};

type BodyProps = ModalTriggerProps & React.ComponentProps<"section">;

const Body = ({
  children,
  close = () => undefined,
  className,
  ...props
}: BodyProps) => {
  return (
    <section className={className} {...props}>
      {renderChildren(children, { close, parent: "Body" })}
    </section>
  );
};

const Footer: FC<
  ModalTriggerProps &
    CustomElementTagProps<"footer" | "section" | "div"> &
    Omit<React.ComponentProps<"div">, "align">
> = ({
  as: Component = "footer",
  close = () => undefined,
  className,
  children,
  ...props
}) => {
  return (
    <Component className={className} {...props}>
      {renderChildren(children, { close, parent: "Footer" })}
    </Component>
  );
};

const Modal = Object.assign(
  React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
      wrapperClassName?: string;
      close: () => void;
    }
  >(function Modal(props, ref) {
    const {
      id,
      wrapperClassName = "",
      className = "",
      children: allChildren,
      close,
      ...modalProps
    } = props;

    return ReactDOM.createPortal(
      <div
        className={className || ""}
        id={id}
        ref={ref}
        role="dialog"
        {...modalProps}
      >
        <div className={wrapperClassName || ""}>
          {renderChildren(allChildren, {
            close,
            parent: "Modal",
          })}
        </div>
      </div>,
      document.body
    );
  }),
  {
    Header,
    Body,
    Footer,
  }
);

type HeaderProps = React.ComponentProps<typeof Header>;
type FooterProps = React.ComponentProps<typeof Footer>;

// <Modal.Header as={"div"} id={"hahahah"}></Modal.Header>;

export type { HeaderProps, BodyProps, FooterProps };

export default Modal;

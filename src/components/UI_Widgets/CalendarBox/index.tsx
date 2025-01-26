import React, { FC, Ref, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import TextBox from "../TextBox";

import type { TextBoxProps } from "../TextBox";

import { hasChildren } from "../../../helpers/render-utils";

import { format, isValid, parse } from "date-fns";


const DateInput = ({ children, ...props }: Omit<TextBoxProps, "labelPosition">) => {
  return (
    <TextBox {...props}>
      {children}
    </TextBox>
  );
};

const CalendarBox: FC<
  React.ComponentProps<"section"> & Pick<React.ComponentProps<"input">, "onChange" | "name" | "id"> & {
    tabIndex?: number;
    numberOfMonths?: number;
    pagedNavigation?: boolean;
    classNames?: Record<string, string>;
    wrapperClassName?: string;
  }
> = React.forwardRef(({
  onChange,
  name,
  id,
  children,
  tabIndex = 0,
  numberOfMonths = 1,
  wrapperClassName =  "",
  pagedNavigation = false,
  className = "",
  classNames = {}
  ...props
}, ref: Ref<HTMLInputElement>) => {
  const textBoxRef = useRef<HTMLInputElement | null>(null);
  const pickerBoxRef = useRef<HTMLDivElement | null>(null);

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
      && styleSheetsOnly.includes("react-busser-headless-ui_calendar")) {
      return;
    }

    const fileStyle = window.document.createElement('style');
    calendarStyle.id = "react-busser-headless-ui_calendar";

    calendarStyle.innerHTML = `
      
      .calendar_wrapper-box {
        position: relative;
        display: inline-block; /* shrink-to-fit trigger */
        min-height: 0;
        min-width: fit-content;
      }

      .calendar_picker-box {
        position: absolute;
        display: none;
        top: 100%;
        left: 0;
      }

      .calendar_picker-box.show,
      .calendar_input-box:focus-within + .calendar_picker-box {
        display: block;
      }
    `;  
    window.document.head.appendChild(calendarStyle);  
  
    return () => {  
      window.document.head.removeChild(calendarStyle);  
    }; 
  }, []);

  const onClick = (event: React.MouseEvent<HTMLElement> & { target: HTMLInputElement }) => {
    /* @HINT: This will be used to 'shim' the `:focus-within` pseudo-class in deficient browsers */
    let isFocusWithinPsuedoSupported = false;
    const focusedElement = event.target as HTMLInputElement;

    if ("CSS" in window) {
      isFocusWithinPsuedoSupported = window.CSS.supports(":focus-within", "");
    } else {
      try {
        /* @CHECK: https://stackoverflow.com/a/58281769 */
        document.querySelector(':focus-within');
        isFocusWithinPsuedoSupported = true;
      } catch {
        isFocusWithinPsuedoSupported = false
      }
    }

    if (focusedElement.tagName !== "INPUT" || isFocusWithinPsuedoSupported) {
      return;
    }

    if (pickerBoxRef.current !== null) {
      pickerBoxRef.current.classList.add("show");
    }
  };

  return (
    <section {...props} tabIndex={tabIndex} className={`calendar_wrapper-box ${wrapperClassName}`}>
      <div className={`calendar_input-box ${className}`} onChange={onChange} onClick={onClick}>
        {children}
      </div>
      <div className={"calendar_picker-box"} ref={pickerBoxRef}>
        <DayPicker
          mode="single"
          classNames={classNames}
          numberOfMonths={numberOfMonths}
          pagedNavigation={pagedNavigation}
        />
      </div>
    </section>
  );
};

CalendarBox.DateInput = DateInput;

/*
import { getDefaultClassNames } from "react-day-picker";

const defaultClassNames = getDefaultClassNames();

<CalendarBox
 className=""
 wrapperClassName=""
 onChange={() => undefined}
 classNames={{
   root: `${defaultClassNames.root} shadow-lg p-5`,
   chevron: `${defaultClassNames.chevron} fill-amber-500`
 }}
>
  <CalendarBox.DateInput
    placeholder="MM/dd/yyyy"
    className=""
  >
    <span>Label:</span> 
  </CalendarBox.DateInput>
</CalendarBox>

*/

type CalendarBoxProps = React.ComponentProps<typeof CalendarBox>;

export type { CalendarBoxProps };

export default CalendarBox;

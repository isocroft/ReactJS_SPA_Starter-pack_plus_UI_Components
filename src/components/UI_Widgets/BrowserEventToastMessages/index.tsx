import React, { useEffect } from "react";

import { useToastManager } from "..."; // makes use of `useBus()` and is a source hook for target hook `useToastUpdates()`

export default function BrowserEventToastMessages = () => {
  const FIVE_SECONDS_DURATION = 5000;
  /* @HINT: This returns a toast API from a `useContext()` */
  const { showToast } = useToastManager({ timeout: FIVE_SECONDS_DURATION });

  useEffect(() => {
    let printingStarted = false;
    const onCopy = (event: Event) => {
      if (event.target.hasAttribute('data-clipboard-object')) {
        showToast(
          { title: "User Action", description: "Copied to clipboard!"}
        );
        console.info("text copied to clipboard!");
      }
    };
    const onPrintingErrored = () => {
      showToast(
        { title: "User Action", description: "Oops! An error occured while printing" },
      );
      console.info(`printing this page (${document.title}) resulted in an error`);
    };
    const onBeforePrintStart = () => {
      showToast(
        { title: "User Action", description: "Please wait... Printing will start shortly!" },
      );
      console.info(`printing this page (${document.title}) is just about to start`);
    };
    const onPrintingStarted = () => {
      printingStarted = true
      console.info(`printing this page (${document.title}) has started`);
    };
    const onAfterPrintEnd = () => {
      if (printingStarted) {
        showToast(
          { title: "User Action", description: "All done with printing!" },
        );
        console.info(`printing this page (${document.title}) has ended`);
        printingStarted = false;
      } else {
        showToast(
          { title: "User Action", description: "Printing was canceled!" },
        );
        console.info(`printing this page (${document.title}) was canceled`);
      }
    };
    const onOnline = () => {
      showToast(
        { title: "Network Connectivity", description: "You are now re-connected to the internet!"},
      );
    };
    const onOffline = () => {
      showToast(
        { title: "Network Connectivity", description: "You seem to not be connected to the internet!"},
      );
    };
    window.addEventListener('copy', onCopy, false);
    window.addEventListener('printingerrored', onPrintingErrored, false);
    window.addEventListener('beforeprintstart', onBeforePrintStart, false);
    window.addEventListener('printingstarted', onPrintingStarted, false);
    window.addEventListener('afterprintend', onAfterPrintEnd, false);
    window.addEventListener('online', onOnline, false);
    window.addEventListener('offline', onOffline, false);
    
    return () => {
      window.removeEventListener('copy', onCopy, false);
      window.removeEventListener('printingerrored', onPrintingErrored, false);
      window.removeEventListener('beforeprintstart', onBeforePrintStart, false);
      window.removeEventListener('printingstarted', onPrintingStarted, false);
      window.removeEventListener('afterprintend', onAfterPrintEnd, false);
      window.removeEventListener('online', onOnline, false);
      window.removeEventListener('offline', onOffline, false);
    }
  }, []);

  return null;
}

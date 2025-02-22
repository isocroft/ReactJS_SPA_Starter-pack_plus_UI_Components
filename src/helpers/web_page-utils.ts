/**
 * verifyDOMElementIsWithinViewPort:
 *
 * @param {HTMLElement} element
 *
 * @returns {Boolean}
 */
export const verifyDOMElementIsWhollyWithinViewport = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();

  const minimumYFrame = 0;
  const minimumXFrame = 0;
  const maximumYFrame = (window.innerHeight || document.documentElement.clientHeight);
  const maximumXFrame = (window.innerWidth || document.documentElement.clientWidth);

  return (
    rect.top >= minimumYFrame &&  
    rect.left >= minimumXFrame &&  
    rect.bottom <= maximumYFrame &&  
    rect.right <= maximumXFrame
  );
};

/*!
 * @EXAMPLE:
 * 
 * const isElementVisibleInViewport = verifyDOMElementIsWhollyWithinViewport(
 *   document.querySelector('[id="compactor"]')
 * )
 *
 * console.log(sElementVisibleInViewport) // true
 */

/**
 * verifyDOMElementIsNotWithinViewPort:
 *
 * @param {HTMLElement} element
 *
 * @returns {Boolean}
 */
export const verifyDOMElementIsNotWithinViewport = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();

  const minimumYFrame = 0;
  const minimumXFrame = 0;
  const maximumYFrame = (window.innerHeight || document.documentElement.clientHeight);
  const maximumXFrame = (window.innerWidth || document.documentElement.clientWidth);
	
  return (
    (rect.top < minimumYFrame &&
      rect.bottom < minimumYFrame) ||
    (rect.left < minimumXFrame &&
      rect.right < minimumXFrame) ||
    rect.y > maximumYFrame ||
    rect.x > maximumXFrame
  );
};

/*!
 * @EXAMPLE:
 * 
 * const isElementNotVisibleInViewport = verifyDOMElementIsNotWithinViewport(
 *   document.querySelector('[id="compactor"]')
 * )
 *
 * console.log(isElementNotVisibleInViewport) // false
 */

/**
 * verifyDOMElementIsOnlyPartiallyWithinViewPort:
 *
 * @param {HTMLElement} element
 *
 * @returns {Boolean}
 */
export const verifyDOMElementIsOnlyPartiallyWithinViewPort = (element: HTMLElement) => {  
  return !(
    verifyDOMElementIsWhollyWithinViewport(element)
  ) && !(
    verifyDOMElementIsNotWithinViewport(element)
  );  
};

/*!
 * @EXAMPLE:
 * 
 * const isElementPartialyVisibleInViewport = verifyDOMElementIsOnlyPartiallyWithinViewPort(
 *   document.querySelector('[id="compactor"]')
 * )
 *
 * console.log(isElementPartialyVisibleInViewport) // true
 */

/**
 * verifyDOMElementIsWhollyOrPartiallyWithinViewPort:
 *
 * @param {HTMLElement} element
 *
 * @returns {Boolean}
 */
export const verifyDOMElementIsWhollyOrPartiallyWithinViewPort = (element: HTMLElement) => {  
  return (
    verifyDOMElementIsWhollyWithinViewport(element)
  ) && !(
    verifyDOMElementIsNotWithinViewport(element)
  );  
};

/*!
 * @EXAMPLE:
 * 
 * const isElementPartialyOrWhollyVisibleInViewport = verifyDOMElementIsWhollyOrPartiallyWithinViewPort(
 *   document.querySelector('[id="compactor"]')
 * )
 *
 * console.log(isElementPartialyOrWhollyVisibleInViewport) // true
 */

/**
 * detectFullScreenTrigger:
 *
 * @param {Event} event
 *
 * @returns {"user-manual" | "programmatic" | "unknown"}
 *
 */
export const detectFullScreenTrigger = (event: Event): string => {
  if (
    window.matchMedia &&
    window.matchMedia('(display-mode: fullscreen)').matches
  ) {
    // page entered fullscreen mode through the Web Application Manifest
    return 'user-manual'
  } else if (document.fullscreenEnabled && document.fullscreenElement) {
    // page entered fullscreen mode through the Fullscreen API
    return 'programmatic'
  }
	
  return 'unknown'
};

/* @EXAMPLE: document.onfullscreenchange = detectFullScreenTrigger; */

/**
 * detectAppleIOS:
 *
 *
 * @returns {Boolean}
 *
 */
export const detectAppleIOS = (): boolean => {
  const global: Window = window
  const navigator: Navigator = global.navigator
  const userAgent = navigator.userAgent.toLowerCase()
  const vendor = navigator.vendor.toLowerCase()

  return /iphone|ipad|ipod/.test(userAgent) && vendor.indexOf('apple') > -1
}

/*!
 * @EXAMPLE:
 *
 * const isIOS = detectAppleIOS();
 *
 * console.log(isIOS) // false
 */

/**
 * isInStandaloneMode:
 *
 *
 * @returns {Boolean}
 *
 */
export const isInStandaloneMode = (): boolean => {
  const global: Window = window
  const navigator: Navigator = global.navigator
  const location: Location = global.location

  /**
   * @CHECK: https://stackoverflow.com/questions/21125337/how-to-detect-if-web-app-running-standalone-on-chrome-mobile
   */
  if (detectAppleIOS() && navigator instanceof Navigator) {
    return navigator.standalone === true
  }

  return (
    location.search.indexOf('standalone=true') !== -1 &&
    Boolean(global.matchMedia('(display-mode: standalone)').matches) &&
    (global.screen.height - document.documentElement.clientHeight < 40 ||
      global.screen.width - document.documentElement.clientHeight < 40)
  )
};

/*!
 * @EXAMPLE:
 *
 * const standalone = isInStandaloneMode();
 *
 * console.log(standalone) // true
 */

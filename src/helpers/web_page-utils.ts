
/*!
 * @EXAMPLE: 
 *
 * const decodedHTML = htmlDecode("&lt;h1&gt;Hi there!&lt;/h1&gt;");
 *
 * console.log(decodedHTML); // "<h1>Hi there!</h1>"
 *
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

/* @EXAMPLE: const isIOS = detectAppleIOS() */

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

/* @EXAMPLE: const standalone = isInStandaloneMode(); */

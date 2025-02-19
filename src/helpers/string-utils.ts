/*
*/
export const removeHyphens = (str: string) => {
  if (typeof str !== "string") {
    throw new TypeError("removeHyphens: argument 1 is not a string");
  }

  if ('replaceAll' in str) {
    return number.replaceAll("-", "");
  }

  return str.replace(/-/g, "");
};

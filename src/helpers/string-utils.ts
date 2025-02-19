/**
 * removeHyphens:
 *
 * @param {String} stringWithHyphens
 *
 * @returns {String}
 *
 */
export const removeHyphens = (stringWithHyphens: string) => {
  if (typeof stringWithHyphens !== "string") {
    throw new TypeError("removeHyphens(...): argument 1 is not a string");
  }

  if ('replaceAll' in stringWithHyphens) {
    return stringWithHyphens.replaceAll("-", "");
  }

  return stringWithHyphens.replace(/-/g, "");
};

/*!
 * @EXAMPLE:
 *
 * const stringWithoutHyphens = removeHyphens("hello-world");
 *
 * console.log(stringWithoutHyphens) // "helloworld"
 *
 */

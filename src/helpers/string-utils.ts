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

/**
 * slugify:
 *
 * @param {String} text
 * @param {String} separator
 *
 * @returns {String}
 *
 */
export const slugify = (text: string, separator = "_") => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "") 
    .replace(/\s+/g, separator);
};

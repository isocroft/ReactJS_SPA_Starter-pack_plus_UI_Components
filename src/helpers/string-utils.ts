/**
 * removeHyphensFromText:
 *
 * @param {String} textWithHyphens
 *
 * @returns {String}
 *
 */
export const removeHyphensFromText = (textWithHyphens: string) => {
  if (typeof textWithHyphens !== "string") {
    throw new TypeError("removeHyphens(...): argument 1 is not a string");
  }

  if ('replaceAll' in textWithHyphens) {
    return textWithHyphens.replaceAll("-", "");
  }

  return textWithHyphens.replace(/-/g, "");
};

/*!
 * @EXAMPLE:
 *
 * const textWithoutHyphens = removeHyphensFromText("hello-world");
 *
 * console.log(textWithoutHyphens) // "helloworld"
 *
 */

/**
 * slugifyText:
 *
 * @param {String} text
 * @param {String} separator
 *
 * @returns {String}
 *
 */
export const slugifyText = (text: string, separator = "_") => {
  if (typeof text !== "string") {
    throw new TypeError("slugify(...): argument 1 is not a string");
  }

  let $separator = separator;

  if (typeof $separator !== "string") {
    throw new TypeError("slugify(...): argument 2 is not a string");
  }

  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "") 
    .replace(/\s+/g, $separator);
};

/*!
 * @EXAMPLE:
 *
 * const slugifiedString = slugifyText("A Bumling Bee");
 *
 * console.log(slugifiedString) // "a_bumbling_bee"
 */

/**
 * truncateText:
 *
 * @param {String} text
 *
 * @returns {String}
 */

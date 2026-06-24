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
    throw new TypeError(
      "removeHyphensFromText(...): argument 1 is not a string"
    );
  }

  if ("replaceAll" in String.prototype) {
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
    throw new TypeError("slugifyText(...): argument 1 is not a string");
  }

  let $separator = separator;

  if (typeof $separator !== "string") {
    throw new TypeError("slugifyText(...): argument 2 is not a string");
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
 * @param {Number} limit
 *
 * @returns {String}
 */
export const truncateText = (text: string, limit: number): string => {
  if (typeof text !== "string") {
    throw new TypeError("truncateText(...): argument 1 is not a string");
  }
  if (typeof limit !== "number") {
    throw new TypeError("truncateText(...): argument 2 is not a number");
  }

  // @HINT: Handle cases where the limit is negative or zero
  if (limit <= 0) {
    return "";
  }

  // @HINT: If the text is already within the limit, return it as-is
  if (text.length <= limit) {
    return text;
  }

  const ellipsis = "...";
  // @HINT: Adjust slice length to account for the ellipsis if necessary
  /* 
    @NOTE:
    
    If the limit is very small (i.e., <= 3), appending "..." would exceed the limit.
    In those edge cases, we slice directly to the limit. Otherwise, we accommodate 
    the ellipsis.
  */
  if (limit <= ellipsis.length) {
    return text.slice(0, limit);
  }

  return text.slice(0, limit - ellipsis.length) + ellipsis;
};

/*!
 * @EXAMPLE:
 *
 * const truncatedText = truncateText("This would only cut off everyone close to you", 23);
 *
 * console.log(truncatedText) // "This would only cut off..."
 *
 */

/**
 * stringToBytes:
 *
 * @param {String} text
 * @param {"ascii" | "utf-8" | "utf-16le" | "utf-16be"} encoding
 *
 * @returns {Array<Number>}
 */
export function stringToBytes(text: string, encoding = "ascii") {
  if (typeof text !== "string") {
    throw new TypeError("stringToBytes(...): argument 1 is not a string");
  }

  if (typeof encoding !== "string") {
    throw new TypeError("stringToBytes(...): argument 2 is not a string");
  } else {
    if (!(["ascii", "utf-8", "utf-16le", "utf-16be"].includes(encoding))) {
      throw new TypeError(
        "stringToBytes(...): argumennt 2 is not a valid string",
        { cause: new Error(
            'argument 2 should one of any: [ "ascii" | "utf-8" | "utf-16le" | "utf-16be" ]'
          )
        }
      );
    }
  }

  if (encoding === "utf-16le") {
    const bytes = [];
    for (let index = 0; index < text.length; index++) {
      const code = text.charCodeAt(index); // eslint-disable-line unicorn/prefer-code-point
      // @ts-ignore
      bytes.push(code & 0xff, (code >> 8) & 0xff); // High byte
    }

    return bytes;
  }

  if (encoding === "utf-16be") {
    const bytes = [];
    for (let index = 0; index < text.length; index++) {
      const code = text.charCodeAt(index); // eslint-disable-line unicorn/prefer-code-point
      // @ts-ignore
      bytes.push((code >> 8) & 0xff, code & 0xff); // Low byte
    }

    return bytes;
  }

  return text.split("").map((character) => character.charCodeAt(0)); // eslint-disable-line unicorn/prefer-code-point
}

/*!
 * @EXAMPLE:
 *
 * const bytes = stringToBytes("hello-world again");
 *
 * console.log(bytes) // [ 104, 101, 108, 108, 111,  45, 119, 111, 114, 108, 100,  32,  97, 103, 97, 105, 110]
 *
 */

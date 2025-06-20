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
    throw new TypeError("removeHyphensFromText(...): argument 1 is not a string");
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
 *
 * @returns {String}
 */
export const truncateText = (text: string) => {
  if (typeof text !== "string") {
    throw new TypeError("truncateText(...): argument 1 is not a string");
  }
  /* @TODO: write implementation... */
};

/**
 * stringToBytes:
 *
 * @param {String} text
 * @param {"ascii" | "utf-8"  "utf-16le" | "utf-16be"} encoding
 *
 * @returns {Array<Number>}
 */
export function stringToBytes(text: string, encoding = 'ascii') {
  if (typeof text !== "string") {
    throw new TypeError("stringToBytes(...): argument 1 is not a string");
  }

	if (encoding === 'utf-16le') {
		const bytes = [];
		for (let index = 0; index < text.length; index++) {
			const code = text.charCodeAt(index); // eslint-disable-line unicorn/prefer-code-point
			bytes.push(code & 0xFF, (code >> 8) & 0xFF); // High byte
		}

		return bytes;
	}

	if (encoding === 'utf-16be') {
		const bytes = [];
		for (let index = 0; index < text.length; index++) {
			const code = text.charCodeAt(index); // eslint-disable-line unicorn/prefer-code-point
			bytes.push((code >> 8) & 0xFF, code & 0xFF); // Low byte
		}

		return bytes;
	}

	return (text.split('').map(character => character.charCodeAt(0))) as const; // eslint-disable-line unicorn/prefer-code-point
}

/**
 * getOrdinalSuffixForNumber:
 *
 * 
 * @param {Number} ordinal
 * @param {Boolean} asWord
 *
 * @returns {String}
 *
 */
export const getOrdinalSuffixForNumber = (ordinal: number, asWord = false): string => {
  if (Number.isNaN(ordinal) || typeof ordinal !== "number") {
    throw new TypeError("getOrdinalSuffixForNumber(...): argument 1 is not a number");
  }

  let ord = "th";

  if (ordinal % 10 == 1 && ordinal % 100 != 11) {
    ord = "st";
  }
  else if (ordinal % 10 == 2 && ordinal % 100 != 12) {
    ord = asWord ? "ond" : "nd";
  }
  else if (ordinal % 10 == 3 && ordinal % 100 != 13) {
    ord = "rd";
  }

  return ord;
};
  
/*!
 * @EXAMPLE:
 *
 * const ordinalSuffix = getOrdinalSuffixForNumber(23);
 *
 * console.log(ordinalWithSuffix) // "rd"
 *
 * console.log(23 + ordinalWithSuffix) // "23rd"
 *
 */

/**
 * getShortSuffixForAmount:
 *
 * @param {Number} amount
 *
 * @returns {String}
 *
 */
export const getShortSuffixForAmount = (amount: number): string => {
  if (Number.isNaN(amount) || typeof amount !== "number") {
    throw new TypeError("getShortSuffixForAmount(...): argument 1 is not a number");
  }

  const strFigure = String(Math.round(amount));
  const [firstPart, ...remainingParts] = strFigure.match(
    /\d{1,3}(?=(\d{3})*$)/g
  ) || ['']
  const shortenedMap: { [key: number]: string } = {
    1: 'K',
    2: 'M',
    3: 'B',
    4: 'T',
    5: 'Z',
  }

  return firstPart !== '' && remainingParts.length
    ? firstPart + shortenedMap[remainingParts.length]
    : firstPart
};

/*!
 * @EXAMPLE:
 * 
 * const amountWithSuffix = getShortSuffixForAmount(305000);
 *
 * console.log(amountWithSuffix) // "305K"
 *
 */

/**
 * getShortSuffixForBytes:
 *
 * @param {Number} bytes
 * @param {Object=} options
 *
 * @returns {String}
 */
export function getShortSuffixForBytes(
  bytes: number,
  opts: {
    decimals?: number
    sizeType?: "accurate" | "normal"
  } = {}
) {
  const { decimals = 0, sizeType = "normal" } = opts

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"]
  if (bytes === 0) return "0 Byte"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate"
      ? (accurateSizes[i] ?? "Bytes")
      : (sizes[i] ?? "Bytes")
  }`
}

/*!
 * @EXAMPLE:
 *
 * const formatedBytes = getShortSuffixForBytes(1024, { sizeType: "accurate" });
 *
 * console.log(formatedBytes) // "1 KiB"
 */

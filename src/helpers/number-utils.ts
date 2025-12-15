/**
 * isNotA_Number:
 *
 * @param {*=} value
 *
 * @returns {Boolean}
 */
function isNotA_Number<C = unknown>(value?: C) {
  let localNumberValue = Boolean(+(value||"")) ? value : -Infinity;
  
  if (typeof value === "string") {
    if (value.length === 0) return true;
    localNumberValue = Number(value);
    return Number.isNaN(localNumberValue);
  }

  if (typeof value === "number") {
    return false;
  }

  if (localNumberValue !== -Infinity) {
    return (typeof value === "number" && !Number.isSafeInteger(value));
  }

  return !Number.isFinite(value);
}

/**
 * nairaFormat:
 *
 * @param {String} numericValue
 *
 * @returns {String}
 */
export function nairaFormat (numericValue: string) {
  if (isNotA_Number(numericValue)){
    throw new TypeError("nairaFormat(...): argument 1 is not numeric");
  }

  return typeof window.Intl === "undefined"
  ? `₦${localeFormat(numericValue)}`
  : new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN"
  }).format(Number(numericValue));
}
/**
 * nairaSplitFormat:
 *
 * @param {String} numericValue
 *
 * @returns {Object<{ naira: string, kobo: string }>}
 */
export function nairaSplitFormat (numericValue: string) {
  const numberValue = nairaFormat(numericValue);
  const [naira, kobo] = numberValue.includes(".") ? numberValue.split(".") : ["0", "00"];

  return { naira, kobo: `.${kobo}` as string } as const;
}

/**
 * localeFormat:
 *
 * @param {String} numericValue
 *
 * @returns {String}
 */
function localeFormat(numericValue: string) {
  return 'toLocaleString' in ({}) && typeof Object.prototype.toLocaleString === 'function'
    ? (Number(numericValue) + 0.001).toLocaleString().slice(0, -1)
    : String(Number(numericValue).toFixed(2)).replace(/^0/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * getOrdinalSuffixForNumber:
 *
 * 
 * @param {Number} ordinal
 * @param {Boolean=} asWord
 *
 * @returns {String}
 *
 */
export const getOrdinalSuffixForNumber = (ordinal: number, asWord = false): string => {
  if (isNotA_Number(ordinal)) {
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
  if (isNotA_Number(amount)) {
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

  if (isNotA_Number(bytes)) {
    throw new TypeError("getShortSuffixForBytes(...): argument 1 is not a number");
  }

  if (isNotA_Number(decimals)) {
    throw new TypeError("getShortSuffixForBytes(...): In argument 2; `decimals` is not a number");
  }

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

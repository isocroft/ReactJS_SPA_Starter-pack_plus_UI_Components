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
  const strFigure = String(Number.isNaN(amount) ? false : Math.round(amount))
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


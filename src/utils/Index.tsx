export const numberToOrdinal = (n: any) => {
    if (typeof n !== 'number' || n < 1 || n > 9) {
      throw new Error('Input must be a number between 1 and 9.');
    }
  
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const exception = [11, 12, 13]; // Numbers that are exceptions to the rule
  
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;
  
    let suffix;
    if (exception.includes(lastTwoDigits)) {
      suffix = 'th';
    } else {
      suffix = suffixes[(lastDigit < 4) ? lastDigit : 0];
    }
  
    return `${n}${suffix} Owner`;
  }
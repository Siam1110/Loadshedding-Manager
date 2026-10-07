export const toBengaliNumeral = (num: number | string, precision: number = 2): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  
  let formattedNum: string;
  if (typeof num === 'number') {
    formattedNum = num.toFixed(precision);
  } else {
    formattedNum = num;
  }

  return formattedNum.replace(/\d/g, (digit) => bnDigits[parseInt(digit, 10)]);
};

export const formatBengaliTime = (time24: string, useBn: boolean = true): string => {
  if (!useBn) return time24;
  return toBengaliNumeral(time24, 0);
};
    

export const getWeekNumber = (d: Date) => {
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
};

export const getSeason = (month: number) => {
  if (month >= 2 && month <= 4) return 'SPRING';
  if (month >= 5 && month <= 7) return 'SUMMER';
  if (month >= 8 && month <= 10) return 'FALL';
  return 'WINTER';
};

export const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

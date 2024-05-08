export const expirationDate = () => {
  let currentDate = new Date();
  currentDate.setTime(currentDate.getTime() + 1 * 60 * 1000);
  return currentDate;
};

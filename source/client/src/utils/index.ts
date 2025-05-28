export const formatDateTime = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedDate = formatter.format(date);
  console.log(formattedDate);
  return formattedDate;
};

export const sortByCreatedAtDesc = (a: any, b: any) => {
  if (a.created_at > b.created_at) return -1;
  if (a.created_at < b.created_at) return 1;
  return 0;
};

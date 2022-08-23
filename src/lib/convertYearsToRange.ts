export function convertYearsToRange(year?: string) {
  if (!year) {
    return [];
  }

  if (year.startsWith('Decade')) {
    const startingYear = Number(year.substring(8, 12));
    const start = `${startingYear}-01-01`;
    const end = `${startingYear + 9}-12-31`;

    return [start, end];
  }

  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  return [start, end];
}
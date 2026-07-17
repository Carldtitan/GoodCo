export function toCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => csvCell(row[header])).join(","),
    ),
  ];

  return `${lines.join("\n")}\n`;
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";

  const text =
    typeof value === "object" ? JSON.stringify(value) : String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

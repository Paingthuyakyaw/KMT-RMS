type CsvColumn<T extends Record<string, any>> = {
  key: keyof T & string;
  label: string;
};

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Escape quotes by doubling, and wrap in quotes if needed
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCsv<T extends Record<string, any>>(args: {
  filename: string;
  columns: CsvColumn<T>[];
  rows: T[];
}) {
  const { filename, columns, rows } = args;
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvCell(row[c.key])).join(","),
  );
  const csv = [header, ...lines].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


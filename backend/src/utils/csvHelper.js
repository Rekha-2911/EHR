/**
 * Simple CSV generator — no external deps needed
 */
function toCSV(rows, columns) {
  if (!rows || rows.length === 0) return columns.join(',') + '\n';
  const header = columns.join(',');
  const lines = rows.map(row =>
    columns.map(col => {
      const val = row[col] ?? '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      // Escape quotes and wrap in quotes if contains comma/newline
      return str.includes(',') || str.includes('\n') || str.includes('"')
        ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  return [header, ...lines].join('\n');
}

module.exports = { toCSV };

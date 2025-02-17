/**
 * Enhanced sanitizer with improved error handling, type safety, and SQL injection protection.
 * sanitize - Adjusts query placeholders based on the database adapter provided.
 * Universal input sanitization with per-adapter database type detection
 * Supports MySQL ('?') and PostgreSQL ('$1', '$2') styles.
 */

type DbAdapter = { getDbType?: () => string };

type SanitizedResult = { query: string; values: any[] };

// Escapes query patterns (basic safety measure, requires proper DB escaping)
function escapeQuery(query: string): string {
  return query.replace(/(["'\\])/g, '\\$1');
}

// Escapes values for SQL queries
function escapeValue(value: any): any {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Main sanitize function
export function sanitize(
  query: string,
  params: any[] = [],
  dbAdapter?: DbAdapter
): SanitizedResult {
  try {
    const dbType = dbAdapter?.getDbType?.() ?? 'mysql';
    const values: any[] = [];
    let paramIndex = 1;

    const sanitizedQuery = query.replace(/\?/g, () => {
      if (!params.length) throw new Error('Insufficient parameters for query placeholders.');
      const value = params.shift();
      values.push(escapeValue(value));
      return dbType === 'postgres' ? `$${paramIndex++}` : '?';
    });

    return { query: escapeQuery(sanitizedQuery), values };
  } catch (error) {
    console.error('Sanitize error:', error);
    throw new Error('Query sanitization failed.');
  }
}

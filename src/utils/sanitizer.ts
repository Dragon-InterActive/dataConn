/**
 * sanitize - Adjusts query placeholders based on the database adapter provided.
 * Universal input sanitization with per-adapter database type detection
 * Supports MySQL ('?') and PostgreSQL ('$1', '$2') styles.
 */
export function sanitize(
    query: string,
    params: any[] = [],
    dbAdapter?: { getDbType?: () => string }
  ): { query: string; values: any[] } {
    const dbType = dbAdapter?.getDbType?.() ?? 'mysql';
    if (!params.length) return { query: escapeQuery(query), values: [] };
  
    const values: any[] = [];
    let paramIndex = 1;
  
    const sanitizedQuery = query.replace(/\?/g, () => {
      const value = params.shift();
      values.push(escapeValue(value));
      return dbType === 'postgres' ? `$${paramIndex++}` : '?';
    });
  
    return { query: sanitizedQuery, values };
  }
  
  /**
   * escapeValue - Supports arrays for SQL IN(...) clauses.
   */
  export function escapeValue(value: any): string {
    if (value == null) return 'NULL';
    if (typeof value === 'number' || typeof value === 'boolean') return value.toString();
    if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
    if (Array.isArray(value)) return value.map((v) => escapeValue(v)).join(', ');
    throw new Error('Unsupported value type for SQL query.');
  }
  
  /**
   * escapeQuery - Escapes queries without prepared statements.
   */
  export function escapeQuery(query: string): string {
    return query.replace(/'/g, "''");
  }
  
  /**
   * inList - Helper for SQL IN(...) clauses.
   */
  export function inList(column: string, values: any[]): string {
    const escapedValues = values.map((value) => escapeValue(value)).join(', ');
    return `${column} IN (${escapedValues})`;
  }
  
  /**
   * notInList - Helper for SQL NOT IN(...) clauses.
   */
  export function notInList(column: string, values: any[]): string {
    const escapedValues = values.map((value) => escapeValue(value)).join(', ');
    return `${column} NOT IN (${escapedValues})`;
  }
  
// Enhanced with ezSQL-inspired functions, automatic adapter detection, and robust error handling.

// Executes a query using the provided database adapter.
async function queryDB(dbInstance: any, query: string, params: any[] = []): Promise<any[]> {
  if (typeof dbInstance.query === 'function') {
    try {
      return await dbInstance.query(query, params);
    } catch (error) {
      console.error("Database query failed:", error);
      throw new Error("Query execution error");
    }
  }
  throw new Error("Unsupported database adapter: Missing query method");
}

// Retrieves a single value from the first row and column.
export async function getVar(dbInstance: any, query: string, params: any[] = []): Promise<any> {
  const result = await queryDB(dbInstance, query, params);
  return result?.[0]?.[Object.keys(result[0])[0]] ?? null;
}

// Retrieves the first row from the results.
export async function getRow(dbInstance: any, query: string, params: any[] = []): Promise<any> {
  const result = await queryDB(dbInstance, query, params);
  return result?.[0] ?? null;
}

// Retrieves the first column from all rows as an array.
export async function getCol(dbInstance: any, query: string, params: any[] = []): Promise<any[]> {
  const result = await queryDB(dbInstance, query, params);
  return result.map(row => Object.values(row)[0] ?? null);
}

// Retrieves all rows from the result set.
export async function getResults(dbInstance: any, query: string, params: any[] = []): Promise<any[]> {
  return await queryDB(dbInstance, query, params);
}

// Additional SQL condition helpers from ezSQL:
export function inList(column: string, values: any[]): string {
  return `${column} IN (${values.map(v => `'${v}'`).join(', ')})`;
}

export function notInList(column: string, values: any[]): string {
  return `${column} NOT IN (${values.map(v => `'${v}'`).join(', ')})`;
}

export function between(column: string, start: any, end: any): string {
  return `${column} BETWEEN '${start}' AND '${end}'`;
}

export function like(column: string, pattern: string): string {
  return `${column} LIKE '${pattern}'`;
}

// Standard comparison utilities:
export function eq(column: string, value: any): string { return `${column} = '${value}'`; }
export function neq(column: string, value: any): string { return `${column} != '${value}'`; }
export function lt(column: string, value: any): string { return `${column} < '${value}'`; }
export function lte(column: string, value: any): string { return `${column} <= '${value}'`; }
export function gt(column: string, value: any): string { return `${column} > '${value}'`; }
export function gte(column: string, value: any): string { return `${column} >= '${value}'`; }

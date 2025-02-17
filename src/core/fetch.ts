// Function collection for relational databases (PostgreSQL, MySQL, SQLite)
// Queries are based directly on database instances passed from dataConn.

import { sanitize, inList, notInList } from "../utils/sanitizer";

/**
 * getVar - Returns the value of the first column from the first row.
 */
export async function getVar(dbInstance: any, query: string, params: any[] = []): Promise<any> {
  const result = await dbInstance.query(query, params);
  return result.length > 0 ? result[0][Object.keys(result[0])[0]] : null;
}

/**
 * getRow - Returns the first row as an object.
 */
export async function getRow(dbInstance: any, query: string, params: any[] = []): Promise<Record<string, any> | null> {
  const result = await dbInstance.query(query, params);
  return result.length > 0 ? result[0] : null;
}

/**
 * getCol - Returns a single column as an array.
 */
export async function getCol(dbInstance: any, query: string, params: any[] = []): Promise<any[]> {
  const result = await dbInstance.query(query, params);
  return result.length > 0 ? result.map(row => row[Object.keys(row)[0]]) : [];
}

/**
 * getResults - Returns all results as an array of objects.
 */
export async function getResults(dbInstance: any, query: string, params: any[] = []): Promise<Record<string, any>[]> {
  return await dbInstance.query(query, params);
}

/**
 * getCount - Returns the number of rows from the query.
 */
export async function getCount(dbInstance: any, query: string, params: any[] = []): Promise<number> {
  const result = await dbInstance.query(query, params);
  return result.length > 0 ? Number(result[0][Object.keys(result[0])[0]]) : 0;
}

/**
 * insert - Executes an INSERT statement and returns the inserted ID if available.
 */
export async function insert(dbInstance: any, query: string, params: any[] = []): Promise<any> {
  const result = await dbInstance.query(query, params);
  return result.insertId ?? null;
}

/**
 * update - Executes an UPDATE statement and returns the number of affected rows.
 */
export async function update(dbInstance: any, query: string, params: any[] = []): Promise<number> {
  const result = await dbInstance.query(query, params);
  return result.affectedRows ?? 0;
}

/**
 * delete - Executes a DELETE statement and returns the number of affected rows.
 */
export async function del(dbInstance: any, query: string, params: any[] = []): Promise<number> {
  const result = await dbInstance.query(query, params);
  return result.affectedRows ?? 0;
}

/**
 * Comparison operators (inspired by ezSQL)
 */
export function eq(column: string, value: any): string { return `${column} = ${sanitize(value)}`; }
export function neq(column: string, value: any): string { return `${column} != ${sanitize(value)}`; }
export function gt(column: string, value: any): string { return `${column} > ${sanitize(value)}`; }
export function gte(column: string, value: any): string { return `${column} >= ${sanitize(value)}`; }
export function lt(column: string, value: any): string { return `${column} < ${sanitize(value)}`; }
export function lte(column: string, value: any): string { return `${column} <= ${sanitize(value)}`; }
export function like(column: string, value: any): string { return `${column} LIKE ${sanitize(value)}`; }
export function notLike(column: string, value: any): string { return `${column} NOT LIKE ${sanitize(value)}`; }
export { inList, notInList }; 
// Provides 'query()' and 'prepared()' functions using the 'sanitize()' helper
import { sanitize } from './sanitize';

// Executes a standard SQL query without parameter binding
export async function query(db: any, sql: string): Promise<any[]> {
    try {
        const result = await db.query(sql);
        return result.rows;
    } catch (error) {
        throw new Error(`Query failed: ${error.message}`);
    }
}

// Executes a parameterized query using prepared statements and sanitization
export async function prepared(db: any, sql: string, params: any[] = []): Promise<any[]> {
    try {
        const { query, values } = sanitize(sql, params);
        const result = await db.query(query, values);
        return result.rows;
    } catch (error) {
        throw new Error(`Prepared query failed: ${error.message}`);
    }
}

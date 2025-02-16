export function sanitize(query: string, params: any[] = []): { query: string; values: any[] } {
    // If no parameters, return the original query immediately
    if (!params || params.length === 0) {
        return { query, values: [] };
    }

    const values: any[] = [];
    let paramIndex = 1;
  
    // Replace placeholders based on the database type (PostgreSQL uses $1, $2, MySQL uses ?)
    const sanitizedQuery = query.replace(/\?/g, () => {
        const value = params.shift();
        values.push(value);
        return `$${paramIndex++}`; // Use PostgreSQL-style numbered placeholders
    });

    return { query: sanitizedQuery, values };
}

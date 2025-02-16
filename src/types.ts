export interface DatabaseAdapter {
    query<T = any>(sql: string, params?: any[]): Promise<T[]>;
    getVar<T = any>(sql: string, params?: any[]): Promise<T | null>;
    getRow<T = any>(sql: string, params?: any[]): Promise<T | null>;
    close(): Promise<void>;
  }
  
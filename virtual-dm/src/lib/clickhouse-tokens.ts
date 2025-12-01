import { clickhouseClient } from './clickhouse'

export interface ClickHouseTokenData {
  name: string;
  totalHP: number;
  ally: boolean;
  imageUrl?: string;
  category: string; // 'default' or 'custom' to match file structure
}

/**
 * Initialize the tokens table in ClickHouse
 */
export async function initializeTokensTable(): Promise<void> {
  try {
    await clickhouseClient.command({
      query: `
        CREATE TABLE IF NOT EXISTS tokens (
          id UUID DEFAULT generateUUIDv4(),
          name String,
          totalHP UInt32,
          ally Bool,
          imageUrl Nullable(String),
          category String DEFAULT 'custom',
          created_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (category, name)
      `
    })
  } catch (error) {
    console.error('Failed to initialize tokens table:', error)
    throw error
  }
}

/**
 * Load tokens from ClickHouse database
 */
export async function loadTokensFromClickHouse(): Promise<ClickHouseTokenData[]> {
  try {
    const result = await clickhouseClient.query({
      query: `
        SELECT name, totalHP, ally, imageUrl, category
        FROM tokens
        ORDER BY category, name
      `,
    })
    
    const data = await result.json<ClickHouseTokenData>()
    return data.data
  } catch (error) {
    console.error('Failed to load tokens from ClickHouse:', error)
    return []
  }
}

/**
 * Save a token to ClickHouse database
 */
export async function saveTokenToClickHouse(token: ClickHouseTokenData): Promise<boolean> {
  try {
    await clickhouseClient.insert({
      table: 'tokens',
      values: [token],
      format: 'JSONEachRow',
    })
    return true
  } catch (error) {
    console.error(`Failed to save token "${token.name}" to ClickHouse:`, error)
    return false
  }
}

/**
 * Save multiple tokens to ClickHouse database
 */
export async function saveTokensToClickHouse(tokens: ClickHouseTokenData[]): Promise<number> {
  if (tokens.length === 0) return 0
  
  try {
    await clickhouseClient.insert({
      table: 'tokens',
      values: tokens,
      format: 'JSONEachRow',
    })
    return tokens.length
  } catch (error) {
    console.error(`Failed to save ${tokens.length} tokens to ClickHouse:`, error)
    return 0
  }
}

/**
 * Check if ClickHouse connection is available and table exists
 */
export async function isClickHouseAvailable(): Promise<boolean> {
  try {
    await clickhouseClient.query({
      query: 'SELECT 1',
    })
    
    // Check if tokens table exists
    const result = await clickhouseClient.query({
      query: "SELECT 1 FROM system.tables WHERE name = 'tokens' AND database = currentDatabase()",
    })
    
    const data = await result.json()
    return data.data.length > 0
  } catch (error) {
    console.warn('ClickHouse not available:', error)
    return false
  }
}

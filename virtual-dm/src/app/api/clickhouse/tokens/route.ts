import { NextResponse } from 'next/server'
import { loadTokensFromClickHouse, isClickHouseAvailable, initializeTokensTable, ClickHouseTokenData } from '@/lib/clickhouse-tokens'

export interface TokenData {
  name: string;
  totalHP: number;
  ally: boolean;
  imageUrl?: string;
}

export interface TokensByCategory {
  default: TokenData[];
  custom: TokenData[];
}

/**
 * Convert ClickHouse token data to TokenData format
 */
function convertClickHouseTokens(clickhouseTokens: ClickHouseTokenData[]): TokensByCategory {
  const result: TokensByCategory = {
    default: [],
    custom: []
  };
  
  clickhouseTokens.forEach(token => {
    const tokenData: TokenData = {
      name: token.name,
      totalHP: token.totalHP,
      ally: token.ally,
      imageUrl: token.imageUrl || undefined
    };
    
    if (token.category === 'default') {
      result.default.push(tokenData);
    } else {
      result.custom.push(tokenData);
    }
  });
  
  // Sort tokens alphabetically by name within each category
  result.default.sort((a, b) => a.name.localeCompare(b.name));
  result.custom.sort((a, b) => a.name.localeCompare(b.name));
  
  return result;
}

export async function GET() {
  try {
    
    const isAvailable = await isClickHouseAvailable();
    
    if (!isAvailable) {
      // Try to initialize the table if it doesn't exist
      try {
        await initializeTokensTable();
      } catch (initError) {
        console.warn('Could not initialize ClickHouse table:', initError);
        return NextResponse.json({
          tokens: { default: [], custom: [] },
          available: false,
          error: 'ClickHouse table initialization failed'
        });
      }
      
      return NextResponse.json({
        tokens: { default: [], custom: [] },
        available: false,
        error: 'ClickHouse not available'
      });
    }
    
    const clickhouseTokensData = await loadTokensFromClickHouse();
    const tokens = convertClickHouseTokens(clickhouseTokensData);
    
    return NextResponse.json({
      tokens,
      available: true
    });
  } catch (error) {
    console.error('Error loading tokens from ClickHouse:', error);
    return NextResponse.json({
      tokens: { default: [], custom: [] },
      available: false,
      error: error instanceof Error ? error.message : 'ClickHouse error'
    }, { status: 500 });
  }
}

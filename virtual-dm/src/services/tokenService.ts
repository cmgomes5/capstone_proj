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
 * Load tokens from local files (client-side, original working method)
 */
async function loadTokensFromDirectory(directory: 'default' | 'custom'): Promise<TokenData[]> {
  try {
    // Load catalog for this directory
    const catalogResponse = await fetch(`/tokens/${directory}/catalog.txt`);
    if (!catalogResponse.ok) {
      console.warn(`No catalog found for ${directory} directory`);
      return [];
    }
    
    const catalogText = await catalogResponse.text();
    const tokenFiles: string[] = catalogText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));
    
    const tokens: TokenData[] = [];
    
    // Load each token file from this directory
    for (const filename of tokenFiles) {
      try {
        const response = await fetch(`/tokens/${directory}/${filename}`);
        if (response.ok) {
          const data: TokenData[] = await response.json();
          tokens.push(...data);
        } else {
          console.warn(`Failed to load ${directory}/${filename}: ${response.statusText}`);
        }
      } catch (fileError) {
        console.warn(`Error loading ${directory}/${filename}:`, fileError);
        // Continue loading other files even if one fails
      }
    }
    
    // Sort tokens alphabetically by name
    return tokens.sort((a, b) => a.name.localeCompare(b.name));
  } catch (dirError) {
    console.warn(`Error loading ${directory} directory:`, dirError);
    return [];
  }
}

/**
 * Load tokens from local files only (client-side)
 */
async function loadTokensFromFiles(): Promise<TokensByCategory> {
  try {
    const [defaultTokensData, customTokensData] = await Promise.all([
      loadTokensFromDirectory('default'),
      loadTokensFromDirectory('custom')
    ]);
    
    return {
      default: defaultTokensData,
      custom: customTokensData
    };
  } catch (error) {
    console.error('Error loading tokens from files:', error);
    return {
      default: [],
      custom: []
    };
  }
}

/**
 * Load tokens from ClickHouse via API route
 */
async function loadTokensFromClickHouse(): Promise<{
  tokens: TokensByCategory;
  available: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/clickhouse/tokens');
    
    if (!response.ok) {
      return {
        tokens: { default: [], custom: [] },
        available: false,
        error: `ClickHouse API failed: ${response.statusText}`
      };
    }
    
    const data = await response.json();
    
    return {
      tokens: data.tokens,
      available: true
    };
  } catch (error) {
    console.warn('Failed to load tokens from ClickHouse:', error);
    return {
      tokens: { default: [], custom: [] },
      available: false,
      error: error instanceof Error ? error.message : 'ClickHouse connection failed'
    };
  }
}

/**
 * Merge tokens from different sources, avoiding duplicates
 */
function mergeTokens(fileTokens: TokensByCategory, dbTokens: TokensByCategory): TokensByCategory {
  const result: TokensByCategory = {
    default: [...fileTokens.default],
    custom: [...fileTokens.custom]
  };
  
  // Add database tokens that don't already exist in file tokens
  const addUniqueTokens = (category: 'default' | 'custom') => {
    const existingNames = new Set(result[category].map(token => token.name.toLowerCase()));
    
    dbTokens[category].forEach(dbToken => {
      if (!existingNames.has(dbToken.name.toLowerCase())) {
        result[category].push(dbToken);
        existingNames.add(dbToken.name.toLowerCase());
      }
    });
    
    // Re-sort after adding new tokens
    result[category].sort((a, b) => a.name.localeCompare(b.name));
  };
  
  addUniqueTokens('default');
  addUniqueTokens('custom');
  
  return result;
}

/**
 * Load tokens from both local files and ClickHouse
 * Files are loaded directly (client-side), ClickHouse via API
 */
export async function loadAllTokens(): Promise<{
  tokens: TokensByCategory;
  sources: {
    clickhouse: boolean;
    files: boolean;
  };
  error?: string;
}> {
  try {
    // Load from local files (client-side, original working method)
    const fileTokens = await loadTokensFromFiles();
    const sources = {
      clickhouse: false,
      files: fileTokens.default.length > 0 || fileTokens.custom.length > 0
    };
    
    // Load from ClickHouse via API
    const clickhouseResult = await loadTokensFromClickHouse();
    sources.clickhouse = clickhouseResult.available;
    
    // Merge tokens from both sources
    const mergedTokens = mergeTokens(fileTokens, clickhouseResult.tokens);
    
    return {
      tokens: mergedTokens,
      sources,
      error: clickhouseResult.error
    };
  } catch (error) {
    console.error('Error loading tokens:', error);
    
    // Return empty result with error
    return {
      tokens: { default: [], custom: [] },
      sources: { clickhouse: false, files: false },
      error: error instanceof Error ? error.message : 'Failed to load tokens'
    };
  }
}

export interface SaveTokenData {
  name: string;
  totalHP: number;
  ally: boolean;
  imageUrl?: string;
}

export interface SaveResult {
  localFile: {
    success: boolean;
    filename?: string;
    error?: string;
  };
  clickhouse: {
    success: boolean;
    error?: string;
  };
}

/**
 * Save token to local file (download JSON file)
 */
function saveTokenToLocalFile(tokenData: SaveTokenData): { success: boolean; filename?: string; error?: string } {
  try {
    // Create filename from token name (sanitized)
    const sanitizedName = tokenData.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${sanitizedName}.json`;

    // Create downloadable file
    const jsonContent = JSON.stringify([tokenData], null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    
    return {
      success: true,
      filename
    };
  } catch (error) {
    console.error('Error saving token to local file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save local file'
    };
  }
}

/**
 * Save token to ClickHouse via API
 */
async function saveTokenToClickHouse(tokenData: SaveTokenData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/clickhouse/save-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...tokenData,
        category: 'custom' // Always save user-created tokens as custom
      }),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error || 'Unknown ClickHouse error'
      };
    }
  } catch (error) {
    console.warn('Error saving token to ClickHouse:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ClickHouse connection failed'
    };
  }
}

/**
 * Save token to both local file and ClickHouse
 * Local file save always happens, ClickHouse is best-effort
 */
export async function saveTokenToBothSources(tokenData: SaveTokenData): Promise<SaveResult> {
  // Save to local file (always happens first)
  const localResult = saveTokenToLocalFile(tokenData);
  
  // Save to ClickHouse (best effort, don't fail if it doesn't work)
  const clickhouseResult = await saveTokenToClickHouse(tokenData);
  
  const result: SaveResult = {
    localFile: localResult,
    clickhouse: clickhouseResult
  };
  
  return result;
}

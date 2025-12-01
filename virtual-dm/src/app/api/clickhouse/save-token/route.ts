import { NextRequest, NextResponse } from 'next/server'
import { saveTokenToClickHouse, ClickHouseTokenData, isClickHouseAvailable, initializeTokensTable } from '@/lib/clickhouse-tokens'

export interface SaveTokenRequest {
  name: string;
  totalHP: number;
  ally: boolean;
  imageUrl?: string;
  category?: string; // 'default' or 'custom', defaults to 'custom'
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveTokenRequest = await request.json()
    
    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Token name is required'
      }, { status: 400 })
    }
    
    if (!body.totalHP || body.totalHP <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Total HP must be a positive number'
      }, { status: 400 })
    }
    
    // Check if ClickHouse is available
    const isAvailable = await isClickHouseAvailable()
    
    if (!isAvailable) {
      // Try to initialize the table if it doesn't exist
      try {
        await initializeTokensTable()
      } catch (initError) {
        console.warn('Could not initialize ClickHouse table:', initError)
        return NextResponse.json({
          success: false,
          error: 'ClickHouse is not available and table could not be initialized'
        }, { status: 503 })
      }
    }
    
    // Prepare token data for ClickHouse
    const tokenData: ClickHouseTokenData = {
      name: body.name.trim(),
      totalHP: body.totalHP,
      ally: body.ally ?? true, // Default to ally if not specified
      imageUrl: body.imageUrl || undefined,
      category: body.category || 'custom' // Default to custom category
    }
    
    // Save to ClickHouse
    const success = await saveTokenToClickHouse(tokenData)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `Token "${tokenData.name}" saved to ClickHouse successfully`,
        token: tokenData
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to save token to ClickHouse'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in save-token API:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

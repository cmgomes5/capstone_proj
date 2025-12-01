import { NextResponse } from 'next/server'
import { initializeTokensTable, saveTokensToClickHouse, ClickHouseTokenData } from '@/lib/clickhouse-tokens'

export async function POST() {
  try {
    // Initialize the tokens table
    await initializeTokensTable()
    
    // Add some sample tokens to demonstrate the functionality
    const sampleTokens: ClickHouseTokenData[] = [
      {
        name: "Goblin Warrior",
        totalHP: 15,
        ally: false,
        imageUrl: "/tokens/default/img/goblin.png",
        category: "default"
      },
      {
        name: "Orc Berserker",
        totalHP: 25,
        ally: false,
        imageUrl: "/tokens/default/img/orc.png",
        category: "default"
      },
      {
        name: "Elven Ranger",
        totalHP: 20,
        ally: true,
        imageUrl: "/tokens/default/img/elf.png",
        category: "default"
      },
      {
        name: "Custom Dragon",
        totalHP: 100,
        ally: false,
        category: "custom"
      },
      {
        name: "Healing Cleric",
        totalHP: 18,
        ally: true,
        category: "custom"
      }
    ]
    
    const savedCount = await saveTokensToClickHouse(sampleTokens)
    
    return NextResponse.json({ 
      success: true, 
      message: `ClickHouse initialized successfully. Added ${savedCount} sample tokens.`,
      tokensAdded: savedCount
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to initialize ClickHouse',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

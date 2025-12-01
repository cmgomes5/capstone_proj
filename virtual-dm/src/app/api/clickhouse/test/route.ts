import { NextResponse } from 'next/server'
import { testClickHouseConnection } from '@/lib/clickhouse'

export async function GET() {
  try {
    const isConnected = await testClickHouseConnection()
    
    if (isConnected) {
      return NextResponse.json({ 
        success: true, 
        message: 'ClickHouse connection successful' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'ClickHouse connection failed' 
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing ClickHouse connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

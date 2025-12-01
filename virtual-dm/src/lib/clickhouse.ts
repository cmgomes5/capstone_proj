import { createClient } from '@clickhouse/client'

// ClickHouse client for local k3d cluster with Tilt
const clickhouseClient = createClient({
  host: 'http://clickhouse-virtual-dm-clickhouse:8123',
  username: 'default',
  password: '', // No password configured in your ClickHouse installation
  database: 'default'
})

export { clickhouseClient }

// Helper function to test connection
export async function testClickHouseConnection() {
  try {
    const result = await clickhouseClient.query({
      query: 'SELECT 1 as test',
    })
    
    const data = await result.json()
    console.log('ClickHouse connection successful:', data)
    return true
  } catch (error) {
    console.error('ClickHouse connection failed:', error)
    return false
  }
}

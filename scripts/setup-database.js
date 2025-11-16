import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read the SQL migration file
const sqlContent = readFileSync(
  join(__dirname, '..', 'supabase_migration.sql'),
  'utf-8'
)

// For this setup script, we'll use the service role key to create tables
// You should run this ONCE and then revoke/rotate the service role key
const SUPABASE_URL = 'https://zvvelglgiynynjhtphok.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.argv[2]

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Please provide the service role key as an argument')
  console.error('Usage: node scripts/setup-database.js YOUR_SERVICE_ROLE_KEY')
  console.error('\n⚠️  After running this script, revoke and regenerate your service role key!')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n')

  try {
    // Execute the SQL migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    })

    if (error) {
      // If exec_sql function doesn't exist, we need to run SQL manually
      if (error.message.includes('function') || error.code === '42883') {
        console.log('⚠️  Unable to execute SQL automatically.')
        console.log('\nPlease run the SQL manually in your Supabase dashboard:')
        console.log('1. Go to https://zvvelglgiynynjhtphok.supabase.co')
        console.log('2. Navigate to SQL Editor')
        console.log('3. Copy and paste the contents of supabase_migration.sql')
        console.log('4. Click "Run"\n')
        return false
      }
      throw error
    }

    console.log('✅ Database schema created successfully!')
    return true
  } catch (error) {
    console.error('❌ Error creating database schema:', error.message)
    console.log('\nPlease run the SQL manually in your Supabase dashboard:')
    console.log('1. Go to https://zvvelglgiynynjhtphok.supabase.co')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of supabase_migration.sql')
    console.log('4. Click "Run"\n')
    return false
  }
}

setupDatabase().then(success => {
  if (success) {
    console.log('\n⚠️  IMPORTANT: Revoke and regenerate your service role key now!')
  }
  process.exit(success ? 0 : 1)
})

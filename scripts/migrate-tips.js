import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env file
const envPath = join(__dirname, '..', '.env')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  }
})

const SUPABASE_URL = envVars.VITE_SUPABASE_URL
const SUPABASE_KEY = envVars.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Read the JSON tips
const tipsPath = join(__dirname, '..', 'src', 'data', 'tips.json')
const tips = JSON.parse(readFileSync(tipsPath, 'utf-8'))

async function migrateTips() {
  console.log(`🚀 Starting migration of ${tips.length} tips...\n`)

  try {
    // Check if table already has data
    const { count, error: countError } = await supabase
      .from('tips')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error checking existing data:', countError.message)
      console.log('\n⚠️  Make sure you have run the SQL migration first!')
      console.log('Run the SQL in supabase/migrations/002_create_tips_table.sql\n')
      process.exit(1)
    }

    if (count > 0) {
      console.log(`⚠️  Table already contains ${count} records.`)
      console.log('Do you want to:')
      console.log('  1. Skip migration (keep existing data)')
      console.log('  2. Delete existing data and re-import')
      console.log('\nTo delete and re-import, run: node scripts/migrate-tips.js --force\n')

      if (!process.argv.includes('--force')) {
        console.log('Migration skipped. Use --force to override.')
        process.exit(0)
      }

      console.log('Deleting existing data...')
      const { error: deleteError } = await supabase
        .from('tips')
        .delete()
        .neq('id', 0) // Delete all records

      if (deleteError) {
        console.error('❌ Error deleting existing data:', deleteError.message)
        process.exit(1)
      }
      console.log('✅ Existing data deleted\n')
    }

    // Insert all tips
    const { data, error } = await supabase
      .from('tips')
      .insert(tips)
      .select()

    if (error) {
      console.error('❌ Error importing tips:', error.message)
      process.exit(1)
    }

    console.log('\n✅ Migration completed successfully!')
    console.log(`📊 Total records imported: ${data.length}`)

    // Verify the import
    const { count: finalCount, error: verifyError } = await supabase
      .from('tips')
      .select('*', { count: 'exact', head: true })

    if (!verifyError) {
      console.log(`✅ Verified: ${finalCount} records in database\n`)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

migrateTips()

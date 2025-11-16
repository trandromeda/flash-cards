# Supabase Database Setup Instructions

## Step 1: Create the Database Table

1. Go to your Supabase dashboard: https://zvvelglgiynynjhtphok.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `supabase_migration.sql` and paste it into the editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see a success message

## Step 2: Verify the Table Was Created

1. In the Supabase dashboard, click on **Table Editor** in the left sidebar
2. You should see a new table called `flashcards`
3. The table should have these columns:
   - id (int8, primary key)
   - vietnamese (text)
   - english (text)
   - example (text, nullable)
   - example_translation (text, nullable)
   - tags (text array)
   - synonym_id (int8, nullable)
   - last_seen (timestamptz, nullable)
   - notes (text, nullable)
   - created_at (timestamptz)
   - updated_at (timestamptz)

## Step 3: Import Your Flashcard Data

After creating the table, run the data migration script:

```bash
node scripts/migrate-data.js
```

This will import all 240 flashcards from `src/data/flashcards.json` into your Supabase database.

## Step 4: Test the Application

```bash
npm run dev
```

Visit http://localhost:5173 and verify that:
- All flashcards load correctly
- Tag filtering works
- Study mode works
- Audio playback works

## Security Note

✅ You're using the publishable/anon key in your `.env` file, which is safe for client-side use.
⚠️ **Remember to revoke the service role key** you generated earlier if you haven't already!

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
   - question (text)
   - answer (text)
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

## Step 4: Add Weighted Random Selection Function

The app uses a PostgreSQL function for intelligent card selection based on spaced repetition.

1. Go back to **SQL Editor** in Supabase
2. Click **New query**
3. Copy the entire contents of `supabase_migration_weighted_random.sql` and paste it
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see a success message

This creates the `get_weighted_random_cards()` function that:
- Calculates weights based on when cards were last seen
- Applies a recency bonus to newly imported cards
- Returns weighted random candidates for optimal learning

## Step 5: Test the Application

```bash
npm run dev
```

Visit http://localhost:5173 and verify that:
- All flashcards load correctly
- Tag filtering works
- Study mode works with smart card selection
- Newly seen cards appear less frequently than unseen cards
- Audio playback works

## Migrating Existing Data (Column Rename)

If you have an existing database with `vietnamese` and `english` columns and need to migrate to `question` and `answer`:

1. Go to **SQL Editor** in Supabase
2. Click **New query**
3. Copy the contents of `supabase_migration_rename_fields.sql` and paste it
4. Click **Run** (or press Cmd/Ctrl + Enter)

This will:
- Rename `vietnamese` column to `question`
- Rename `english` column to `answer`
- Update the `get_weighted_random_cards()` function to use the new column names

## Security Note

✅ You're using the publishable/anon key in your `.env` file, which is safe for client-side use.
⚠️ **Remember to revoke the service role key** you generated earlier if you haven't already!

# Tips Feature Setup Guide

This guide explains how to set up the new Tips feature in the Vietnamese Flash Cards application.

## Overview

Tips are language learning notes that provide grammar explanations, usage patterns, and nuances of Vietnamese. They appear below flashcards in Study mode and rotate when cards change or when clicked.

## Setup Steps

### 1. Run the Database Migration

First, create the tips table in your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open and run the migration file: `supabase/migrations/002_create_tips_table.sql`

This creates:
- A `tips` table with columns: `id`, `title`, `content`, `category`, `tags`, `created_at`, `updated_at`
- Row Level Security (RLS) policies for public access
- Indexes on `tags` and `category` for efficient filtering
- Auto-update trigger for the `updated_at` timestamp

### 2. Review the Initial Tips Data

Before populating the database, review the cleaned-up tips data:

```bash
cat src/data/tips.json
```

The tips have been transformed from the rough notes in `tips.md` into polished, educational content with:
- **title**: A clear, concise heading
- **content**: Detailed explanation of the grammar rule or usage pattern
- **category**: Classification (e.g., "grammar", "vocabulary")
- **tags**: Related keywords for future filtering

Make any edits to `src/data/tips.json` as needed before proceeding.

### 3. Populate the Database

Once you're satisfied with the tips content, run the migration script:

```bash
node scripts/migrate-tips.js
```

This will:
- Read the tips from `src/data/tips.json`
- Insert them into the Supabase `tips` table
- Verify the import was successful

To force re-import (delete and replace existing tips):

```bash
node scripts/migrate-tips.js --force
```

### 4. Start the Development Server

The tips feature is now integrated into the app:

```bash
npm run dev
```

## Features

### In the App

1. **Study View**: Tips appear below the flashcard with a lightbulb icon on a yellow background
2. **Collapsible Tips**:
   - Tips are collapsed by default showing only the title
   - Click the tip header to expand/collapse the full content
   - Click the shuffle icon button to manually show the next random tip
3. **Tip Rotation**:
   - Tips automatically rotate every 5 minutes (same interval as background images)
4. **Markdown Formatting**: Tips support rich text with bold, bullets, and paragraphs
5. **New Tip Button**: Click "New Tip" in the header to add tips via the UI with live preview

### Database Structure

The `tips` table schema:

```sql
CREATE TABLE tips (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Adding New Tips

### Via the UI

1. Click the "New Tip" button in the header
2. Fill in:
   - **Title** (required): A clear, concise heading
   - **Content** (required): Detailed explanation with markdown formatting
     - Use `**text**` for bold
     - Use `- item` for bullet lists
     - Use blank lines for paragraphs
     - Click "Preview" button to see how it will render
   - **Category** (optional): e.g., "grammar", "vocabulary"
   - **Tags** (optional): Related keywords
3. Click "Create"

**Content Formatting:**
The content field supports markdown syntax. Type your text using markdown in the textarea, then click the "Preview" button to see how it will appear. Common markdown:
- `**bold text**` → **bold text**
- `- bullet point` → • bullet point
- **IMPORTANT:** Blank lines are required before lists and create paragraph breaks

Example (note the blank line before the list):
```
**'đi ngủ'** means 'to go to sleep' and can be used any time.

**'đi nghỉ'** has multiple meanings:

- 'to rest'
- 'to take a break'
- 'to go on vacation'
```

### Via the Database

1. Go to Supabase Dashboard → Table Editor → tips
2. Click "Insert row"
3. Fill in the fields
4. Save

### Via Bulk Import

1. Add tips to `src/data/tips.json`
2. Run: `node scripts/migrate-tips.js --force`

## File Structure

```
src/
├── context/
│   └── TipsContext.jsx          # State management for tips
├── components/
│   ├── TipCard.jsx              # Display component for a single tip
│   ├── TipFormDialog.jsx        # Form for creating/editing tips
│   ├── NewTipDialog.jsx         # Button + dialog for new tips
│   └── views/
│       └── StudyView.jsx        # Updated to show tips
├── data/
│   └── tips.json                # Initial tips data
scripts/
└── migrate-tips.js              # Script to populate tips table
supabase/
└── migrations/
    └── 002_create_tips_table.sql # Database schema for tips
```

## Tips Content Guidelines

When creating new tips:

1. **Title**: Short and descriptive (e.g., "Using 'xem' vs 'gặp'")
2. **Content**:
   - Explain the rule or pattern clearly
   - Provide examples with Vietnamese text
   - Include translations where helpful
   - Keep it concise but complete
3. **Category**: Use consistent categories:
   - `grammar` - Grammar rules and sentence structure
   - `vocabulary` - Word usage and meanings
   - `pronunciation` - Pronunciation guides
   - `culture` - Cultural context
4. **Tags**: Add relevant keywords for future filtering

## Future Enhancements

Potential improvements to the tips feature:

- [ ] Filter tips by category/tags
- [ ] Edit tips directly from the tip card
- [ ] Mark tips as "learned" or "favorite"
- [ ] Show related tips based on current flashcard tags
- [ ] Search tips
- [ ] Export/import tips as JSON

## Troubleshooting

**Tips not showing up?**
1. Check that the migration ran successfully: `node scripts/migrate-tips.js`
2. Verify tips exist in Supabase: Dashboard → Table Editor → tips
3. Check browser console for errors

**Can't create new tips?**
1. Verify Supabase RLS policies are enabled
2. Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in `.env`

**Tips not rotating?**
1. Check that you have multiple tips in the database
2. Verify the TipsProvider is wrapping the app in `App.jsx`

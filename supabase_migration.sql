-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  example TEXT,
  example_translation TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  synonym_id INTEGER REFERENCES flashcards(id) ON DELETE SET NULL,
  last_seen TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on tags for faster filtering
CREATE INDEX IF NOT EXISTS idx_flashcards_tags ON flashcards USING GIN(tags);

-- Create index on last_seen for sorting by recency
CREATE INDEX IF NOT EXISTS idx_flashcards_last_seen ON flashcards(last_seen);

-- Create index on synonym_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_flashcards_synonym_id ON flashcards(synonym_id);

-- Enable Row Level Security
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access"
  ON flashcards
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow public insert access
CREATE POLICY "Allow public insert access"
  ON flashcards
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow public update access
CREATE POLICY "Allow public update access"
  ON flashcards
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policy to allow public delete access
CREATE POLICY "Allow public delete access"
  ON flashcards
  FOR DELETE
  TO public
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before updates
CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON flashcards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

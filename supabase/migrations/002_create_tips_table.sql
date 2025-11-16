-- Create tips table for storing language learning tips
CREATE TABLE IF NOT EXISTS tips (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (same pattern as flashcards)
CREATE POLICY "Enable read access for all users" ON tips
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON tips
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON tips
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON tips
  FOR DELETE USING (true);

-- Create index on tags for filtering
CREATE INDEX idx_tips_tags ON tips USING GIN (tags);

-- Create index on category for filtering
CREATE INDEX idx_tips_category ON tips (category);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tips_updated_at
  BEFORE UPDATE ON tips
  FOR EACH ROW
  EXECUTE FUNCTION update_tips_updated_at();

-- Add comment to table
COMMENT ON TABLE tips IS 'Stores Vietnamese language learning tips, grammar notes, and usage patterns';

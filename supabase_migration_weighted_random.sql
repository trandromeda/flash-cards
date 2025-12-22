-- Add function to get weighted random flashcards
-- This function calculates weights based on last_seen and created_at timestamps
-- and returns a set of candidate cards for client-side random selection

CREATE OR REPLACE FUNCTION get_weighted_random_cards(
  selected_tags text[] DEFAULT NULL,
  candidate_count integer DEFAULT 20
)
RETURNS TABLE (
  id integer,
  question text,
  answer text,
  example text,
  example_translation text,
  tags text[],
  synonym_id integer,
  last_seen timestamptz,
  notes text,
  created_at timestamptz,
  updated_at timestamptz,
  weight numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH weighted_cards AS (
    SELECT
      f.*,
      CASE
        -- Never seen? Weight = 100
        WHEN f.last_seen IS NULL THEN 100::numeric
        ELSE
          -- Base weight: sqrt(hours since last seen) + 1
          (
            FLOOR(SQRT(EXTRACT(EPOCH FROM (NOW() - f.last_seen)) / 3600)) + 1
          )
          -- Recency bonus for cards < 30 days old
          * (
            CASE
              WHEN EXTRACT(EPOCH FROM (NOW() - f.created_at)) / 86400 < 30
              THEN (1.5 - (EXTRACT(EPOCH FROM (NOW() - f.created_at)) / 86400 / 30) * 0.5)
              ELSE 1.0
            END
          )
      END::numeric as card_weight
    FROM flashcards f
    WHERE
      -- Tag filtering: if selected_tags is null or empty, return all cards
      -- Otherwise, check if card tags overlap with selected tags
      (selected_tags IS NULL OR selected_tags = '{}' OR f.tags && selected_tags)
  )
  SELECT
    wc.id,
    wc.question,
    wc.answer,
    wc.example,
    wc.example_translation,
    wc.tags,
    wc.synonym_id,
    wc.last_seen,
    wc.notes,
    wc.created_at,
    wc.updated_at,
    wc.card_weight
  FROM weighted_cards wc
  -- Weighted random: multiply random() by weight to favor higher-weighted cards
  ORDER BY (random() * wc.card_weight) DESC
  LIMIT candidate_count;
END;
$$;

-- Add comment to document the function
COMMENT ON FUNCTION get_weighted_random_cards IS
  'Returns weighted random flashcards based on spaced repetition algorithm. Uses square root growth for last_seen and applies 1.5x recency bonus for cards < 30 days old. Returns a set of candidate cards that can be randomly selected client-side.';

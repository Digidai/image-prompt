CREATE TABLE IF NOT EXISTS catalog_entries (
  row_id INTEGER PRIMARY KEY AUTOINCREMENT,
  release_id TEXT NOT NULL,
  id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  model_group TEXT NOT NULL,
  collection_key TEXT NOT NULL,
  requires_reference INTEGER,
  evidence_type TEXT NOT NULL,
  published_at TEXT,
  curated_order INTEGER NOT NULL,
  likes INTEGER,
  prompt_length INTEGER NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  content_availability TEXT NOT NULL DEFAULT 'full',
  record_key TEXT NOT NULL,
  summary_json TEXT NOT NULL,
  UNIQUE (release_id, id)
);
CREATE INDEX IF NOT EXISTS catalog_release_order ON catalog_entries(release_id,curated_order);
CREATE INDEX IF NOT EXISTS catalog_release_category ON catalog_entries(release_id,category,curated_order);
CREATE INDEX IF NOT EXISTS catalog_release_collection ON catalog_entries(release_id,collection_key,curated_order);
CREATE INDEX IF NOT EXISTS catalog_release_model ON catalog_entries(release_id,model_group,curated_order);
CREATE VIRTUAL TABLE IF NOT EXISTS catalog_fts USING fts5(search_text, tokenize='unicode61');

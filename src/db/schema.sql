-- ═══════════════════════════════════════════════════════════
-- VoxFlow — SQLite Database Schema
-- ═══════════════════════════════════════════════════════════

-- Settings (key-value store for app configuration)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Profile
CREATE TABLE IF NOT EXISTS user_profile (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT DEFAULT '',
  role TEXT DEFAULT '',
  industry TEXT DEFAULT '',
  tone TEXT DEFAULT 'professional',
  custom_tone_instruction TEXT DEFAULT '',
  permanent_instructions TEXT DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CHECK (id = 1)  -- Single row table
);

-- Writing Samples (for style analysis)
CREATE TABLE IF NOT EXISTS writing_samples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'manual',    -- 'manual', 'auto-learned'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dictionary (custom word replacements)
CREATE TABLE IF NOT EXISTS dictionary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original TEXT NOT NULL UNIQUE,
  replacement TEXT NOT NULL,
  auto_learned BOOLEAN DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Correct Spellings (words to recognize correctly)
CREATE TABLE IF NOT EXISTS correct_spellings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'general',  -- 'name', 'technical', 'brand', 'general'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transcription History
CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_text TEXT NOT NULL,
  enhanced_text TEXT,
  stt_provider TEXT NOT NULL,
  llm_provider TEXT,
  llm_model TEXT,
  active_app TEXT,
  language TEXT,
  audio_duration_ms INTEGER,
  stt_latency_ms INTEGER,
  llm_latency_ms INTEGER,
  word_count INTEGER,
  is_linkedin_reply BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Snippets (voice shortcuts) — v2.0
CREATE TABLE IF NOT EXISTS snippets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trigger_phrase TEXT NOT NULL UNIQUE,
  replacement_text TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Base Documents — v2.0 (for RAG)
CREATE TABLE IF NOT EXISTS knowledge_docs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_path TEXT,
  file_type TEXT,
  chunk_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Base Chunks (with embeddings) — v2.0
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding BLOB,               -- Serialized float32 array
  chunk_index INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doc_id) REFERENCES knowledge_docs(id) ON DELETE CASCADE
);

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial schema version
INSERT OR IGNORE INTO schema_version (version) VALUES (1);

-- Insert default user profile
INSERT OR IGNORE INTO user_profile (id) VALUES (1);

-- ═══════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at);
CREATE INDEX IF NOT EXISTS idx_history_active_app ON history(active_app);
CREATE INDEX IF NOT EXISTS idx_dictionary_original ON dictionary(original);
CREATE INDEX IF NOT EXISTS idx_snippets_trigger ON snippets(trigger_phrase);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_doc ON knowledge_chunks(doc_id);

-- Add wr_parameter to related_searches
ALTER TABLE related_searches ADD COLUMN IF NOT EXISTS wr_parameter integer DEFAULT 1;

-- Add countdown and content fields to pre_landing_config
ALTER TABLE pre_landing_config ADD COLUMN IF NOT EXISTS countdown_seconds integer DEFAULT 3;
ALTER TABLE pre_landing_config ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE pre_landing_config ADD COLUMN IF NOT EXISTS redirect_description text;

-- Add wr_parameter to web_results
ALTER TABLE web_results ADD COLUMN IF NOT EXISTS wr_parameter integer DEFAULT 1;
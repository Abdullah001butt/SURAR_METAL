-- Lets a document's final amount be typed in directly instead of always being
-- computed from line-item qty x price — useful when a quote was originally a
-- lump-sum handwritten total (no per-item pricing) and item rows only exist
-- to describe the scope of work, not to individually price it.
alter table documents add column if not exists manual_total numeric null;

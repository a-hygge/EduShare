USE studocu;

-- Expand file_type column to support long mimetype strings
ALTER TABLE documents MODIFY COLUMN file_type VARCHAR(255);

-- Verify the change
DESCRIBE documents;

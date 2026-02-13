-- Add logo_remove_background column to navbar_config table if it doesn't exist

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'navbar_config' AND column_name = 'logo_remove_background') THEN
        ALTER TABLE navbar_config ADD COLUMN logo_remove_background BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read Access (Anon and Authenticated)
CREATE POLICY "Public Read Products" ON products
FOR SELECT USING (true);

CREATE POLICY "Public Read Partners" ON partners
FOR SELECT USING (true);

CREATE POLICY "Public Read Categories" ON categories
FOR SELECT USING (true);

-- Policy: Admin Write Access (Authenticated Users Only)
-- Adjust 'authenticated' to specific roles or email checks if needed
CREATE POLICY "Admin Write Products" ON products
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Write Partners" ON partners
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Write Categories" ON categories
FOR ALL USING (auth.role() = 'authenticated');

-- Optional: Allow Service Role full access (usually default, but good to be explicit if needed, though service_role bypasses RLS by default)

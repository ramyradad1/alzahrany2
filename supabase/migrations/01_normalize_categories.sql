-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert unique categories from products
INSERT INTO categories (name_en, name_ar)
SELECT DISTINCT category, category -- initializing ar with same name for now, can be updated later
FROM products
WHERE category IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add category_id to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);

-- Populate category_id
UPDATE products
SET category_id = categories.id
FROM categories
WHERE products.category = categories.name_en;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

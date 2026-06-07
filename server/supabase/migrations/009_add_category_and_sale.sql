-- Add category_type with default 'CLUB' and check constraint
ALTER TABLE jerseys ADD COLUMN IF NOT EXISTS category_type VARCHAR(50) DEFAULT 'CLUB';

ALTER TABLE jerseys DROP CONSTRAINT IF EXISTS check_category_type;
ALTER TABLE jerseys ADD CONSTRAINT check_category_type CHECK (category_type IN ('INTERNATIONAL', 'CLUB', 'SHORTS', 'OTHER'));

-- Add sale system columns
ALTER TABLE jerseys ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT FALSE;
ALTER TABLE jerseys ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10,2);

-- Add constraint: if is_on_sale is true, sale_price must be present and less than price
ALTER TABLE jerseys DROP CONSTRAINT IF EXISTS check_sale_price;
ALTER TABLE jerseys ADD CONSTRAINT check_sale_price CHECK (
  (is_on_sale = FALSE) OR 
  (is_on_sale = TRUE AND sale_price IS NOT NULL AND sale_price < price)
);

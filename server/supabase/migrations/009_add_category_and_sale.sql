-- Add category_type with default 'CLUB' and check constraint
ALTER TABLE public.jerseys ADD COLUMN category_type VARCHAR(50) DEFAULT 'CLUB';

ALTER TABLE public.jerseys DROP CONSTRAINT IF EXISTS check_category_type;
ALTER TABLE public.jerseys ADD CONSTRAINT check_category_type CHECK (category_type IN ('INTERNATIONAL', 'CLUB', 'SHORTS', 'OTHER'));

-- Add sale system columns
ALTER TABLE public.jerseys ADD COLUMN is_on_sale BOOLEAN DEFAULT FALSE;
ALTER TABLE public.jerseys ADD COLUMN sale_price NUMERIC(10,2);

-- Add constraint: if is_on_sale is true, sale_price must be present and less than price
ALTER TABLE public.jerseys DROP CONSTRAINT IF EXISTS check_sale_price;
ALTER TABLE public.jerseys ADD CONSTRAINT check_sale_price CHECK (
  (is_on_sale = FALSE) OR 
  (is_on_sale = TRUE AND sale_price IS NOT NULL AND sale_price < price)
);

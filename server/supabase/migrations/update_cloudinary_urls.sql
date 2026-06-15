-- Update jersey_images table
UPDATE public.jersey_images
SET url = REPLACE(url, 'dlnf5iam6', 'dalnbaeaz')
WHERE url LIKE '%dlnf5iam6%';

-- Update jerseys table (legacy columns if they exist)
UPDATE public.jerseys
SET image_url_1 = REPLACE(image_url_1, 'dlnf5iam6', 'dalnbaeaz')
WHERE image_url_1 LIKE '%dlnf5iam6%';

UPDATE public.jerseys
SET image_url_2 = REPLACE(image_url_2, 'dlnf5iam6', 'dalnbaeaz')
WHERE image_url_2 LIKE '%dlnf5iam6%';

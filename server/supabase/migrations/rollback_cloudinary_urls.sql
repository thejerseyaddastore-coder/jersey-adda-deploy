-- Rollback jersey_images table
UPDATE public.jersey_images
SET url = REPLACE(url, 'dalnbaeaz', 'dlnf5iam6')
WHERE url LIKE '%dalnbaeaz%';

-- Rollback jerseys table (legacy columns if they exist)
UPDATE public.jerseys
SET image_url_1 = REPLACE(image_url_1, 'dalnbaeaz', 'dlnf5iam6')
WHERE image_url_1 LIKE '%dalnbaeaz%';

UPDATE public.jerseys
SET image_url_2 = REPLACE(image_url_2, 'dalnbaeaz', 'dlnf5iam6')
WHERE image_url_2 LIKE '%dalnbaeaz%';

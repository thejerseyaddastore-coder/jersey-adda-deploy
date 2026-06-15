export function getJerseyImages(jersey) {
  const images = [];

  const add = (value) => {
    if (!value || images.includes(value)) return;
    images.push(value);
  };

  add(jersey?.image_url_1);
  add(jersey?.image_url_2);
  add(jersey?.image_url);
  add(jersey?.cover_image_url);

  if (Array.isArray(jersey?.images)) {
    jersey.images.forEach((image) => add(image?.url));
  }

  if (Array.isArray(jersey?.jersey_images)) {
    jersey.jersey_images
      .slice()
      .sort((left, right) => (left.position ?? 0) - (right.position ?? 0))
      .forEach((image) => add(image?.url));
  }

  return images.length > 0 ? images : ['/placeholder-jersey.svg'];
}

export function getPrimaryJerseyImage(jersey) {
  return getJerseyImages(jersey)[0];
}

export function optimizeCloudinaryUrl(url, width = 300) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com')) return url;
  
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;
  
  const prefix = url.substring(0, uploadIndex + 8);
  const suffix = url.substring(uploadIndex + 8);
  const transform = `w_${width},c_fill,f_auto,q_auto/`;
  
  return `${prefix}${transform}${suffix}`;
}


function optimizeCloudinaryUrl(url, width = 300) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com')) return url;
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;
  return `${url.substring(0, uploadIndex + 8)}w_${width},c_fill,f_auto,q_auto/${url.substring(uploadIndex + 8)}`;
}

export default function BrandLogo({ className = '', showWordmark = true }) {
  const logoUrl = 'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780690665/WhatsApp_Image_2026-06-06_at_01.36.22_pvwztm.jpg';

  return (
    <div className={`brand ${className}`.trim()}>
      <div className="brand-mark">
        <img
          src={optimizeCloudinaryUrl(logoUrl, 100)}
          alt="Jersey Adda logo"
          loading="eager"
        />
      </div>
      {showWordmark ? (
        <span className="brand-copy">
          <strong>Jersey Adda</strong>
          <small>Premium Store Admin</small>
        </span>
      ) : null}
    </div>
  );
}
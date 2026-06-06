export default function BrandLogo({ className = '', showWordmark = true }) {
  const logoUrl = 'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780690665/WhatsApp_Image_2026-06-06_at_01.36.22_pvwztm.jpg';

  return (
    <div className={`brand ${className}`.trim()}>
      <div className="brand-mark">
        <img
          src={logoUrl}
          alt="Jersey Adda logo"
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
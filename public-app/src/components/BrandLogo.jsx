export default function BrandLogo({ className = '', showWordmark = true, compact = false, tone = 'light' }) {
  const logoSizeClass = compact ? 'h-10 w-10' : 'h-12 w-12';
  const titleClass = tone === 'dark' ? 'text-white' : 'text-gray-900';
  const subtitleClass = tone === 'dark' ? 'text-gray-300' : 'text-brand-600';
  const logoUrl = 'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780690665/WhatsApp_Image_2026-06-06_at_01.36.22_pvwztm.jpg';

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <img
        src={logoUrl}
        alt="Jersey Adda logo"
        className={`${logoSizeClass} rounded-full object-contain bg-white shrink-0 shadow-sm`}
      />
      {showWordmark ? (
        <div className="hidden sm:block">
          <h1 className={`text-xl font-heading font-extrabold uppercase tracking-wider leading-tight ${titleClass}`}>Jersey Adda</h1>
          {!compact ? <p className={`text-[10px] font-sans font-bold tracking-widest uppercase ${subtitleClass}`}>Premium Store</p> : null}
        </div>
      ) : null}
    </div>
  );
}

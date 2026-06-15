import { X } from 'lucide-react';
import { optimizeCloudinaryUrl } from '../utils/image';

const sizeChartUrl = 'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780725540/WhatsApp_Image_2026-06-06_at_11.14.52_kafncm.jpg';

export default function SizeChartModal({ open, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close size chart" />

      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">Jersey Adda</p>
            <h2 className="mt-1 text-3xl font-black uppercase tracking-tight">Size Chart</h2>
            <p className="mt-2 text-sm text-gray-300">Measurements are shown in inches. Pick the size that matches your fit best.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/15 p-2 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Close size chart">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-white p-4 text-gray-900 sm:p-6">
          <img
            src={optimizeCloudinaryUrl(sizeChartUrl, 800)}
            alt="Jersey Adda size chart"
            loading="lazy"
            className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-200 object-contain"
          />
        </div>
      </div>
    </div>
  );
}

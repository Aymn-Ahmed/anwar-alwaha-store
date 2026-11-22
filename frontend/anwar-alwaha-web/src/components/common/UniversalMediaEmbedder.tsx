import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export type MediaKind = 'tiktok' | 'youtube' | 'video' | 'image';

interface ParsedMediaItem {
  kind: MediaKind;
  url: string;
}

interface UniversalMediaEmbedderProps {
  mediaType?: string | null;
  mediaUrl?: string | null;
  title?: string;
}

function extractTikTokId(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{10,25}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/\/video\/(\d+)/i) || trimmed.match(/\/v\/(\d+)/i);
  return match ? match[1] : null;
}

function extractYouTubeEmbedUrl(raw: string): string | null {
  const trimmed = raw.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m && m[1]) return `https://www.youtube.com/embed/${m[1]}?rel=0`;
  }
  return null;
}

function detectKind(url: string, fallbackType?: string | null): MediaKind {
  const lower = url.toLowerCase();
  const fb = (fallbackType || '').toLowerCase();

  if (lower.includes('tiktok.com') || /^\d{10,25}$/.test(url.trim())) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(lower) || lower.startsWith('data:video/')) return 'video';
  if (/\.(jpg|jpeg|png|webp|gif|svg|avif)(\?|$)/i.test(lower) || lower.startsWith('data:image/')) return 'image';

  if (fb === 'tiktok' || fb === 'youtube' || fb === 'video' || fb === 'image') return fb;
  return 'image';
}

function parseMediaItems(mediaUrl?: string | null, mediaType?: string | null): ParsedMediaItem[] {
  if (!mediaUrl || !mediaUrl.trim()) return [];
  const trimmed = mediaUrl.trim();

  // Support JSON array of URLs or {type, url} objects
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => {
            if (typeof entry === 'string' && entry.trim()) {
              return { kind: detectKind(entry, mediaType), url: entry.trim() };
            }
            if (entry && typeof entry.url === 'string' && entry.url.trim()) {
              return { kind: detectKind(entry.url, entry.type || mediaType), url: entry.url.trim() };
            }
            return null;
          })
          .filter(Boolean) as ParsedMediaItem[];
      }
    } catch {
      // fall through
    }
  }

  // Split by newlines or pipe (preserving single data: URLs which have no newlines)
  const parts = trimmed.startsWith('data:')
    ? [trimmed]
    : trimmed
        .split(/[\n|]+/)
        .map((s) => s.trim())
        .filter(Boolean);

  return parts.map((url) => ({
    kind: detectKind(url, mediaType),
    url,
  }));
}

export const UniversalMediaEmbedder: React.FC<UniversalMediaEmbedderProps> = ({
  mediaType,
  mediaUrl,
  title = 'معاينة الوسائط',
}) => {
  const items = useMemo(() => parseMediaItems(mediaUrl, mediaType), [mediaUrl, mediaType]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [mediaUrl, mediaType]);

  if (items.length === 0) return null;

  const safeIdx = Math.min(index, items.length - 1);
  const current = items[safeIdx];
  const hasMultiple = items.length > 1;

  const goPrev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const goNext = () => setIndex((i) => (i + 1) % items.length);

  const renderContent = () => {
    if (current.kind === 'tiktok') {
      const videoId = extractTikTokId(current.url);
      const externalUrl = current.url.startsWith('http')
        ? current.url
        : videoId
        ? `https://www.tiktok.com/@anwaralwaha/video/${videoId}`
        : current.url;

      return (
        <div className="space-y-3">
          <div className="w-full rounded-2xl border border-zinc-200 bg-white p-3 flex justify-center">
            {videoId ? (
              <div className="w-full max-w-[340px] aspect-[9/14] rounded-xl overflow-hidden bg-black shadow-md">
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${videoId}`}
                  title={title}
                  className="w-full h-full border-0"
                  allow="encrypted-media; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="py-12 px-6 text-center text-zinc-500 text-xs space-y-2">
                <div className="text-3xl">🎵</div>
                <p>اضغط على الزر أدناه لمشاهدة الفيديو على تيك توك</p>
              </div>
            )}
          </div>

          <a
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-zinc-900 hover:bg-black text-white font-black text-xs sm:text-sm py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span>مشاهدة على تيك توك 🎵</span>
            <ExternalLink size={15} />
          </a>
        </div>
      );
    }

    if (current.kind === 'youtube') {
      const embedUrl = extractYouTubeEmbedUrl(current.url);
      return (
        <div className="w-full rounded-2xl overflow-hidden border border-zinc-200 bg-black aspect-video shadow-sm">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/80 text-xs gap-2 p-4">
              <span>تعذر تضمين رابط يوتيوب</span>
              <a
                href={current.url}
                target="_blank"
                rel="noreferrer"
                className="underline text-white font-bold"
              >
                فتح الفيديو على يوتيوب ↗
              </a>
            </div>
          )}
        </div>
      );
    }

    if (current.kind === 'video') {
      return (
        <div className="w-full rounded-2xl overflow-hidden border border-zinc-200 bg-black aspect-video shadow-sm">
          <video
            key={current.url}
            src={current.url}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    // Image
    return (
      <div className="w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center max-h-[460px]">
        <img
          src={current.url}
          alt={title}
          className="w-full max-h-[460px] object-contain"
          loading="lazy"
        />
      </div>
    );
  };

  return (
    <div className="relative space-y-2.5">
      <div className="relative">
        {renderContent()}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="السابق"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center shadow-lg transition-all"
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="التالي"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center shadow-lg transition-all"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex items-center justify-center gap-2 pt-1">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === safeIdx ? 'w-6 bg-zinc-900' : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'
              }`}
            />
          ))}
          <span className="text-[11px] font-bold text-zinc-400 mr-2">
            {safeIdx + 1} / {items.length}
          </span>
        </div>
      )}
    </div>
  );
};

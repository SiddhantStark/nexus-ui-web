import { useState, type ImgHTMLAttributes } from 'react';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError' | 'alt'> & { alt: string };
function ImageContent({ src, alt, className = '', loading = 'lazy', ...props }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        role={alt ? 'img' : undefined}
        aria-label={alt ? `${alt} — image unavailable` : undefined}
        aria-hidden={alt ? undefined : true}
        className={`inline-flex items-center justify-center bg-slate-100 text-slate-600 ${className}`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-8 h-8 max-w-full max-h-full"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="m3 17 6-6 4 4 3-3 5 5" />
          <circle cx="15" cy="8" r="1" />
        </svg>
      </span>
    );
  }
  return (
    <img
      {...props}
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
/** Keying by source retries when an editor supplies a different URL, without error loops. */
export default function Image(props: Props) {
  return <ImageContent key={props.src} {...props} />;
}

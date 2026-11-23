import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Music } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { normalizeSpotifyEmbedUrl } from '../../services/contentService';

interface SpotifyPlayerProps {
  spotifyUrl?: string;
  defaultExpanded?: boolean;
  className?: string;
}

const DEFAULT_SPOTIFY_SHARE_URL = 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC';

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
  spotifyUrl,
  defaultExpanded = true,
  className = '',
}) => {
  const { dir, t } = useSettings();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const embedUrl = useMemo(() => normalizeSpotifyEmbedUrl(spotifyUrl), [spotifyUrl]);
  const isCustom = Boolean(spotifyUrl && spotifyUrl.trim().length > 0 && !spotifyUrl.includes('37i9dQZF1DXdPec7aLTmlC'));
  const externalUrl =
    spotifyUrl && spotifyUrl.trim().startsWith('http')
      ? spotifyUrl.trim()
      : DEFAULT_SPOTIFY_SHARE_URL;

  return (
    <div
      dir={dir}
      className={`rounded-2xl bg-slate-900 text-white border border-emerald-400/40 shadow-lg overflow-hidden transition-all ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 shrink-0 shadow">
            <Music className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-extrabold text-sm truncate">{t('spotifyTitle')}</p>
            {!isCustom && (
              <p className="text-[11px] text-emerald-300/90 truncate">{t('spotifyDefaultNote')}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-emerald-200 transition-colors"
            title={t('spotifyOpenExternal')}
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t('spotifyOpenExternal')}</span>
          </a>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-xs font-bold text-emerald-100 transition-colors"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
                <span>{t('spotifyCollapse')}</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
                <span>{t('spotifyExpand')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keep iframe mounted when collapsed so Spotify playback does not reset */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          expanded ? 'h-[152px] opacity-100 p-2 bg-slate-950/60' : 'h-0 opacity-0 p-0 pointer-events-none'
        }`}
      >
        <iframe
          title={t('spotifyTitle')}
          src={embedUrl}
          width="100%"
          height="136"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl w-full"
        />
      </div>
    </div>
  );
};

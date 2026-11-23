import React, { useEffect, useState } from 'react';
import {
  Cake,
  Home,
  LayoutGrid,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tv,
} from 'lucide-react';
import { AccessibilityBar } from './components/common/AccessibilityBar';
import { HostDashboard } from './components/host/HostDashboard';
import { PlayerClient } from './components/player/PlayerClient';
import { useSettings } from './context/SettingsContext';

type AppMode = 'landing' | 'host' | 'player' | 'split';

function getRoomCodeFromUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = new URLSearchParams(window.location.search).get('room') ?? '';
    return raw.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  } catch {
    return '';
  }
}

export function App() {
  const { dir, t } = useSettings();
  const [urlRoomCode, setUrlRoomCode] = useState<string>(() => getRoomCodeFromUrl());
  const [mode, setMode] = useState<AppMode>(() => (getRoomCodeFromUrl() ? 'player' : 'landing'));
  const [splitRoomCode, setSplitRoomCode] = useState<string>('7070');

  useEffect(() => {
    const handlePopState = () => {
      const room = getRoomCodeFromUrl();
      setUrlRoomCode(room);
      if (room) {
        setMode('player');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleBackHome = () => {
    if (typeof window !== 'undefined' && window.location.search.includes('room=')) {
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, '', cleanUrl);
      setUrlRoomCode('');
    }
    setMode('landing');
  };

  const handleStartSplitDemo = () => {
    const rand = Math.floor(10 + Math.random() * 89);
    setSplitRoomCode(`70${rand}`);
    setMode('split');
  };

  if (mode === 'host') {
    return (
      <main className="min-h-screen p-3 sm:p-6">
        <HostDashboard onBackHome={handleBackHome} />
      </main>
    );
  }

  if (mode === 'player') {
    return (
      <main className="min-h-screen p-3 sm:p-6">
        <PlayerClient
          initialRoomCode={urlRoomCode || undefined}
          onBackHome={handleBackHome}
        />
      </main>
    );
  }

  if (mode === 'split') {
    return (
      <main dir={dir} className="min-h-screen p-3 sm:p-5 space-y-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-white/95 backdrop-blur border-2 border-amber-300 px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleBackHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-sm"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>{t('backToHome')}</span>
            </button>
            <span className="font-black text-slate-900 text-sm sm:text-base">
              {t('splitDemoTitle')}
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs sm:text-sm">
            {t('roomCodeLabel')}: #{splitRoomCode}
          </span>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          <section className="xl:col-span-7 rounded-3xl bg-white/50 border-2 border-rose-200/80 p-3 sm:p-4 shadow-lg">
            <HostDashboard initialRoomCode={splitRoomCode} compact />
          </section>

          <section className="xl:col-span-5 rounded-[2.2rem] bg-slate-900 p-3 shadow-2xl border-4 border-slate-800">
            <div className="rounded-[1.6rem] bg-gradient-to-b from-amber-50 to-rose-50 p-3 sm:p-4 min-h-[620px]">
              <PlayerClient initialRoomCode={splitRoomCode} compact />
            </div>
          </section>
        </div>
      </main>
    );
  }

  // LANDING SCREEN
  return (
    <main dir={dir} className="min-h-screen p-4 sm:p-8 flex flex-col justify-between">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <AccessibilityBar />

        {/* Hero Card */}
        <header className="rounded-3xl bg-white/95 backdrop-blur border-2 border-rose-200 shadow-xl p-6 sm:p-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-sm font-black shadow">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>{t('birthdayBadge')}</span>
          </div>

          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-100 via-pink-100 to-amber-100 border-2 border-rose-300 flex items-center justify-center mx-auto shadow-md animate-float-gentle">
            <Cake className="w-10 h-10 text-rose-600" aria-hidden="true" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-rose-900 leading-tight">
            {t('appTitle')}
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            {t('appSubtitle')}
          </p>
        </header>

        {/* Mode Selection */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-center text-slate-900">
            {t('chooseModeTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Host Screen (TV) */}
            <button
              type="button"
              onClick={() => setMode('host')}
              className="group text-start rounded-3xl bg-white/95 hover:bg-white border-2 border-rose-200 hover:border-rose-400 p-6 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Tv className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-black text-rose-900">{t('hostModeTitle')}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t('hostModeDesc')}</p>
              </div>
              <span className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-rose-50 group-hover:bg-rose-500 text-rose-700 group-hover:text-white font-extrabold text-sm transition-colors">
                {t('openLobbyBtn')}
              </span>
            </button>

            {/* Player Mobile */}
            <button
              type="button"
              onClick={() => setMode('player')}
              className="group text-start rounded-3xl bg-white/95 hover:bg-white border-2 border-sky-200 hover:border-sky-400 p-6 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Smartphone className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-black text-sky-900">{t('playerModeTitle')}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t('playerModeDesc')}</p>
              </div>
              <span className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-sky-50 group-hover:bg-sky-500 text-sky-700 group-hover:text-white font-extrabold text-sm transition-colors">
                {t('joinPartyBtn')}
              </span>
            </button>

            {/* Split-Screen Demo */}
            <button
              type="button"
              onClick={handleStartSplitDemo}
              className="group text-start rounded-3xl bg-white/95 hover:bg-white border-2 border-amber-300 hover:border-amber-500 p-6 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <LayoutGrid className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-black text-amber-900">{t('splitDemoTitle')}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t('splitDemoDesc')}</p>
              </div>
              <span className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-amber-50 group-hover:bg-amber-500 text-amber-900 group-hover:text-white font-extrabold text-sm transition-colors">
                {t('splitDemoTitle')}
              </span>
            </button>
          </div>
        </section>
      </div>

      {/* Privacy Footer */}
      <footer className="w-full max-w-5xl mx-auto pt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{t('demoDataNote')}</span>
        </div>
      </footer>
    </main>
  );
}

export default App;

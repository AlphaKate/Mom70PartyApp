import React from 'react';
import { Award, Crown, Medal, Trophy } from 'lucide-react';
import { getAvatarDisplayName } from '../../constants/avatars';
import { useSettings } from '../../context/SettingsContext';
import { Player } from '../../types/game';
import { AvatarDisplay } from './AvatarDisplay';

export interface FinalePodiumProps {
  /** Pre-sorted leaderboard list (highest score first). */
  players: Player[];
}

/**
 * Finale podium (1st, 2nd, 3rd) + full participant standings with localized avatar descriptions.
 */
export const FinalePodium: React.FC<FinalePodiumProps> = ({ players }) => {
  const { lang, t } = useSettings();

  return (
    <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border-2 border-amber-300 dark:border-amber-500/40 shadow-xl p-6 space-y-6">
      <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white flex items-center justify-center gap-2">
        <Trophy className="w-7 h-7 text-amber-500 dark:text-amber-400" aria-hidden="true" />
        <span>{t('podiumTitle')}</span>
      </h3>

      {players.length === 0 ? (
        <p className="text-center text-slate-600 dark:text-slate-300 font-bold">{t('noPlayersYet')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
          {/* 2nd Place */}
          <div className="order-2 sm:order-1">
            {players[1] && (
              <div className="rounded-3xl bg-gradient-to-b from-slate-100 via-white to-slate-200 dark:from-slate-800 dark:via-slate-800/95 dark:to-slate-900 border-2 border-slate-300 dark:border-slate-500/80 p-5 text-center space-y-2 shadow-md sm:min-h-[210px] flex flex-col justify-center">
                <Medal className="w-8 h-8 text-slate-600 dark:text-slate-300 mx-auto" aria-hidden="true" />
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                  {t('place2')}
                </span>
                <div className="flex justify-center py-1">
                  <AvatarDisplay avatar={players[1].avatar} className="w-16 h-16 drop-shadow-md" />
                </div>
                <p className="text-lg font-black text-slate-900 dark:text-white truncate">
                  {players[1].name}
                </p>
                <p
                  data-testid="podium-avatar-desc-2"
                  className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight line-clamp-2"
                >
                  {getAvatarDisplayName(players[1].avatar, lang)}
                </p>
                <p className="inline-block mx-auto px-3 py-0.5 rounded-full bg-slate-900/10 dark:bg-slate-200/15 text-base font-extrabold text-slate-900 dark:text-sky-200">
                  {players[1].score} {t('scoreUnit')}
                </p>
              </div>
            )}
          </div>

          {/* 1st Place */}
          <div className="order-1 sm:order-2">
            {players[0] && (
              <div className="rounded-3xl bg-gradient-to-b from-amber-100 via-yellow-50 to-amber-200 dark:from-amber-950 dark:via-slate-900 dark:to-amber-950/90 border-4 border-amber-400 dark:border-amber-400/80 p-6 text-center space-y-2 shadow-xl sm:min-h-[250px] flex flex-col justify-center">
                <Crown className="w-10 h-10 text-amber-700 dark:text-amber-300 mx-auto animate-bounce-slow" aria-hidden="true" />
                <span className="text-sm font-black uppercase text-amber-900 dark:text-amber-300">
                  {t('place1')}
                </span>
                <div className="flex justify-center py-1">
                  <AvatarDisplay avatar={players[0].avatar} className="w-20 h-20 drop-shadow-xl" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white truncate">
                  {players[0].name}
                </p>
                <p
                  data-testid="podium-avatar-desc-1"
                  className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 leading-tight line-clamp-2"
                >
                  {getAvatarDisplayName(players[0].avatar, lang)}
                </p>
                <p className="inline-block mx-auto px-3 py-0.5 rounded-full bg-amber-900/10 dark:bg-amber-400/20 text-lg font-black text-amber-950 dark:text-amber-200">
                  {players[0].score} {t('scoreUnit')}
                </p>
              </div>
            )}
          </div>

          {/* 3rd Place */}
          <div className="order-3">
            {players[2] && (
              <div className="rounded-3xl bg-gradient-to-b from-orange-100 via-amber-50 to-orange-200/90 dark:from-orange-950 dark:via-stone-900 dark:to-amber-950/90 border-2 border-orange-300 dark:border-orange-400/70 p-5 text-center space-y-2 shadow-md sm:min-h-[185px] flex flex-col justify-center">
                <Award className="w-8 h-8 text-orange-700 dark:text-orange-300 mx-auto" aria-hidden="true" />
                <span className="text-xs font-black uppercase text-orange-900 dark:text-orange-300">
                  {t('place3')}
                </span>
                <div className="flex justify-center py-1">
                  <AvatarDisplay avatar={players[2].avatar} className="w-14 h-14 drop-shadow-md" />
                </div>
                <p className="text-lg font-black text-slate-900 dark:text-white truncate">
                  {players[2].name}
                </p>
                <p
                  data-testid="podium-avatar-desc-3"
                  className="text-xs sm:text-sm font-bold text-orange-950 dark:text-orange-100 leading-tight line-clamp-2"
                >
                  {getAvatarDisplayName(players[2].avatar, lang)}
                </p>
                <p className="inline-block mx-auto px-3 py-0.5 rounded-full bg-orange-900/10 dark:bg-orange-400/20 text-base font-extrabold text-orange-950 dark:text-orange-200">
                  {players[2].score} {t('scoreUnit')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Standings */}
      {players.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <h4 className="text-base font-black text-slate-900 dark:text-white">{t('allParticipants')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {players.map((player, idx) => (
              <div
                key={player.id}
                className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-amber-500 dark:bg-amber-400 text-white dark:text-slate-950 text-xs font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <AvatarDisplay avatar={player.avatar} className="w-7 h-7 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate leading-tight">
                      {player.name}
                    </p>
                    <p className="text-xs font-bold text-slate-600 dark:text-sky-200 truncate leading-tight">
                      {getAvatarDisplayName(player.avatar, lang)}
                    </p>
                  </div>
                </div>
                <span className="font-black text-amber-800 dark:text-amber-300 text-sm shrink-0">
                  {player.score} {t('scoreUnit')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

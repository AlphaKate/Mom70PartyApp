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
    <div className="rounded-3xl bg-white/95 backdrop-blur border-2 border-amber-300 shadow-xl p-6 space-y-6">
      <h3 className="text-2xl font-black text-center text-slate-900 flex items-center justify-center gap-2">
        <Trophy className="w-7 h-7 text-amber-500" aria-hidden="true" />
        <span>{t('podiumTitle')}</span>
      </h3>

      {players.length === 0 ? (
        <p className="text-center text-slate-500 font-bold">{t('noPlayersYet')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
          {/* 2nd Place */}
          <div className="order-2 sm:order-1">
            {players[1] && (
              <div className="rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300 p-5 text-center space-y-2 shadow-md sm:min-h-[210px] flex flex-col justify-center">
                <Medal className="w-8 h-8 text-slate-500 mx-auto" aria-hidden="true" />
                <span className="text-xs font-black uppercase text-slate-600">
                  {t('place2')}
                </span>
                <div className="flex justify-center py-1">
                  <AvatarDisplay avatar={players[1].avatar} className="w-16 h-16 drop-shadow-md" />
                </div>
                <p className="text-lg font-black text-slate-900 truncate">
                  {players[1].name}
                </p>
                <p
                  data-testid="podium-avatar-desc-2"
                  className="text-xs sm:text-sm font-bold text-rose-700/90 dark:text-rose-300 leading-tight line-clamp-2"
                >
                  {getAvatarDisplayName(players[1].avatar, lang)}
                </p>
                <p className="text-base font-extrabold text-rose-700">
                  {players[1].score} {t('scoreUnit')}
                </p>
              </div>
            )}
          </div>

          {/* 1st Place */}
          <div className="order-1 sm:order-2">
            {players[0] && (
              <div className="rounded-3xl bg-gradient-to-b from-amber-200 via-yellow-100 to-amber-300 border-4 border-amber-400 p-6 text-center space-y-2 shadow-xl sm:min-h-[250px] flex flex-col justify-center">
                <Crown className="w-10 h-10 text-amber-700 mx-auto animate-bounce-slow" aria-hidden="true" />
                <span className="text-sm font-black uppercase text-amber-900">
                  {t('place1')}
                </span>
                <div className="flex justify-center py-1">
                  <AvatarDisplay avatar={players[0].avatar} className="w-20 h-20 drop-shadow-xl" />
                </div>
                <p className="text-2xl font-black text-slate-900 truncate">
                  {players[0].name}
                </p>
                <p
                  data-testid="podium-avatar-desc-1"
                  className="text-xs sm:text-sm font-bold text-rose-700/90 dark:text-rose-300 leading-tight line-clamp-2"
                >
                  {getAvatarDisplayName(players[0].avatar, lang)}
                </p>
                <p className="text-lg font-black text-rose-700">
                  {players[0].score} {t('scoreUnit')}
                </p>
              </div>
            )}
          </div>

          {/* 3rd Place */}
          <div className="order-3">
            {players[2] && (
              <div className="rounded-3xl bg-gradient-to-b from-orange-100 to-amber-100 border-2 border-orange-300 p-5 text-center space-y-2 shadow-md sm:min-h-[185px] flex flex-col justify-center">
                <Award className="w-8 h-8 text-orange-600 mx-auto" aria-hidden="true" />
                <span className="text-xs font-black uppercase text-orange-800">
                  {t('place3')}
                </span>
                <div className="flex justify-center py-1">
                  <AvatarDisplay avatar={players[2].avatar} className="w-14 h-14 drop-shadow-md" />
                </div>
                <p className="text-lg font-black text-slate-900 truncate">
                  {players[2].name}
                </p>
                <p
                  data-testid="podium-avatar-desc-3"
                  className="text-xs sm:text-sm font-bold text-rose-700/90 dark:text-rose-300 leading-tight line-clamp-2"
                >
                  {getAvatarDisplayName(players[2].avatar, lang)}
                </p>
                <p className="text-base font-extrabold text-rose-700">
                  {players[2].score} {t('scoreUnit')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Standings */}
      {players.length > 0 && (
        <div className="pt-4 border-t border-amber-200 space-y-3">
          <h4 className="text-base font-black text-slate-800">{t('allParticipants')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {players.map((player, idx) => (
              <div
                key={player.id}
                className="flex items-center justify-between gap-2 rounded-2xl bg-amber-50/70 border border-amber-200 px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <AvatarDisplay avatar={player.avatar} className="w-7 h-7 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate leading-tight">
                      {player.name}
                    </p>
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-300 truncate leading-tight">
                      {getAvatarDisplayName(player.avatar, lang)}
                    </p>
                  </div>
                </div>
                <span className="font-black text-rose-700 text-sm shrink-0">
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

import React from 'react';

export interface AvatarDisplayProps {
  avatar: string;
  className?: string;
  title?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  className = 'w-8 h-8',
  title,
}) => {
  // If it's one of our custom cartoon avatars, render the specific SVG illustration:
  switch (avatar) {
    // ------------------------------------------------------------------
    // FAIRIES & MAGIC
    // ------------------------------------------------------------------
    case 'fairy_nap':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Fairy Nap'}>
          <circle cx="50" cy="50" r="48" fill="#e0e7ff" stroke="#818cf8" strokeWidth="3" />
          {/* Nightcap & stars */}
          <path d="M26 44 C26 22, 60 12, 78 20 C70 28, 64 36, 62 45 Z" fill="#6366f1" />
          <circle cx="80" cy="20" r="5" fill="#fef08a" />
          {/* Face */}
          <circle cx="50" cy="56" r="26" fill="#fed7aa" />
          {/* Sleeping mask */}
          <rect x="32" y="42" width="36" height="15" rx="7.5" fill="#ec4899" />
          <path d="M37 50 Q41 54 45 50 M55 50 Q59 54 63 50" stroke="#ffffff" strokeWidth="2" fill="none" />
          {/* Sleepy smile */}
          <path d="M46 68 Q50 72 54 68" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Wand with Zzz */}
          <path d="M72 75 L84 62" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          <polygon points="84,58 86,63 91,63 87,66 89,71 84,68 80,71 82,66 78,63 83,63" fill="#facc15" />
          <text x="20" y="32" fontSize="14" fontWeight="900" fill="#4f46e5" fontFamily="sans-serif">Zzz</text>
        </svg>
      );

    case 'fairy_cash':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Fairy Cash'}>
          <circle cx="50" cy="50" r="48" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" />
          {/* Sparkly Tiara */}
          <polygon points="35,32 42,20 50,28 58,20 65,32 50,30" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="50" cy="24" r="2.5" fill="#ec4899" />
          {/* Face */}
          <circle cx="50" cy="54" r="27" fill="#ffedd5" />
          {/* Chic dark sunglasses */}
          <polygon points="30,46 47,46 44,58 33,58" fill="#18181b" />
          <polygon points="53,46 70,46 67,58 56,58" fill="#18181b" />
          <line x1="47" y1="48" x2="53" y2="48" stroke="#18181b" strokeWidth="2.5" />
          {/* Glass glare */}
          <line x1="33" y1="49" x2="38" y2="55" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <line x1="56" y1="49" x2="61" y2="55" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          {/* Red lipstick smile */}
          <path d="M43 68 Q50 76 57 68" stroke="#e11d48" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Gold Coin / Credit card in hand */}
          <circle cx="78" cy="70" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <text x="78" y="76" textAnchor="middle" fontSize="15" fontWeight="900" fill="#78350f" fontFamily="sans-serif">$</text>
          {/* Wand with diamond sparkle */}
          <polygon points="20,24 23,28 28,30 23,32 20,36 18,32 13,30 18,28" fill="#fb7185" />
        </svg>
      );

    case 'fairy_told_you':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Fairy Told You'}>
          <circle cx="50" cy="50" r="48" fill="#ccfbf1" stroke="#0d9488" strokeWidth="3" />
          {/* Fairy bun hair */}
          <circle cx="50" cy="30" r="16" fill="#b45309" />
          <circle cx="50" cy="56" r="26" fill="#ffedd5" />
          {/* Glasses on nose */}
          <rect x="31" y="47" width="16" height="11" rx="3" fill="none" stroke="#be123c" strokeWidth="2.5" />
          <rect x="53" y="47" width="16" height="11" rx="3" fill="none" stroke="#be123c" strokeWidth="2.5" />
          <line x1="47" y1="52" x2="53" y2="52" stroke="#be123c" strokeWidth="2" />
          {/* Eyes looking over glasses */}
          <circle cx="39" cy="45" r="3.5" fill="#1e293b" />
          <circle cx="61" cy="45" r="3.5" fill="#1e293b" />
          {/* Knowing smirk */}
          <path d="M45 68 Q53 72 59 64" stroke="#9f1239" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Raised index finger ("I told you!") */}
          <g transform="translate(18, 52)">
            <rect x="0" y="0" width="8" height="22" rx="4" fill="#fed7aa" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="4" cy="2" r="3" fill="#fed7aa" />
          </g>
          {/* Exclamation badge */}
          <circle cx="80" cy="32" r="10" fill="#f43f5e" />
          <text x="80" y="38" textAnchor="middle" fontSize="14" fontWeight="900" fill="#ffffff" fontFamily="sans-serif">!</text>
        </svg>
      );

    case 'fairy_carb':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Carb Gremlin'}>
          <circle cx="50" cy="50" r="48" fill="#ffedd5" stroke="#ea580c" strokeWidth="3" />
          {/* Chubby Elf Face */}
          <circle cx="50" cy="48" r="28" fill="#fed7aa" />
          {/* Pointy Elf Ears */}
          <polygon points="22,48 10,40 24,36" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
          <polygon points="78,48 90,40 76,36" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
          {/* Happy closed arched eyes */}
          <path d="M36 44 Q42 38 48 44" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M52 44 Q58 38 64 44" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Rosy blush cheeks */}
          <ellipse cx="34" cy="54" rx="6" ry="4" fill="#fda4af" opacity="0.8" />
          <ellipse cx="66" cy="54" rx="6" ry="4" fill="#fda4af" opacity="0.8" />
          {/* Giant golden croissant being hugged */}
          <path d="M26 78 C24 58, 76 58, 74 78 C64 68, 36 68, 26 78 Z" fill="#d97706" stroke="#92400e" strokeWidth="2" />
          <path d="M35 70 C42 63, 58 63, 65 70" stroke="#fef3c7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Crumbs */}
          <circle cx="48" cy="58" r="1.5" fill="#b45309" />
          <circle cx="53" cy="60" r="1.5" fill="#b45309" />
          <circle cx="50" cy="54" r="1" fill="#b45309" />
        </svg>
      );

    case 'fairy_espresso':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Unicorn Espresso'}>
          <circle cx="50" cy="50" r="48" fill="#fae8ff" stroke="#a855f7" strokeWidth="3" />
          {/* Rainbow mane */}
          <path d="M25 45 Q15 25 35 18 Q20 35 30 55" fill="#ec4899" />
          <path d="M35 18 Q30 5 50 12" fill="#3b82f6" />
          {/* Golden lightning horn */}
          <polygon points="48,32 54,10 58,32" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          {/* White Unicorn Head */}
          <path d="M32 60 C32 40, 68 40, 72 65 C72 78, 45 80, 32 68 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Wild energetic wide eyes */}
          <circle cx="56" cy="50" r="9" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
          <circle cx="56" cy="50" r="4" fill="#a855f7" />
          <circle cx="57" cy="48" r="1.5" fill="#ffffff" />
          {/* Steaming Espresso Cup */}
          <rect x="62" y="66" width="22" height="18" rx="4" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
          <path d="M84 70 C88 70, 89 78, 84 80" fill="none" stroke="#b91c1c" strokeWidth="2" />
          <path d="M68 62 Q70 56 68 52 M74 62 Q76 56 74 52" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'fairy_cleaner':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Cleaner Fairy'}>
          <circle cx="50" cy="50" r="48" fill="#cffafe" stroke="#06b6d4" strokeWidth="3" />
          {/* Head & Polka dot cleaning bandana */}
          <circle cx="50" cy="54" r="26" fill="#fed7aa" />
          <path d="M26 48 C28 30, 72 30, 74 48 C64 42, 36 42, 26 48 Z" fill="#f43f5e" />
          <circle cx="40" cy="38" r="2.5" fill="#ffffff" />
          <circle cx="52" cy="36" r="2.5" fill="#ffffff" />
          <circle cx="62" cy="40" r="2.5" fill="#ffffff" />
          {/* Bandana bow tie */}
          <polygon points="50,28 44,22 56,22" fill="#f43f5e" />
          {/* Cheerful determined face */}
          <circle cx="42" cy="52" r="3.5" fill="#0f172a" />
          <circle cx="58" cy="52" r="3.5" fill="#0f172a" />
          <path d="M44 64 Q50 70 56 64" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Sparkle on tooth */}
          <polygon points="56,64 57,61 60,61 57,63 58,66 56,64" fill="#38bdf8" />
          {/* Feather duster wand */}
          <g transform="translate(68, 48)">
            <line x1="0" y1="35" x2="16" y2="10" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="20" cy="8" rx="8" ry="12" fill="#ec4899" transform="rotate(30 20 8)" />
            <ellipse cx="22" cy="5" rx="6" ry="10" fill="#a855f7" transform="rotate(20 22 5)" />
          </g>
          <text x="14" y="32" fontSize="16" fill="#0284c7">✨</text>
        </svg>
      );

    case 'fairy_drama':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Drama Queen'}>
          <circle cx="50" cy="50" r="48" fill="#fce7f3" stroke="#ec4899" strokeWidth="3" />
          {/* Huge glamorous Crown */}
          <polygon points="26,30 36,12 50,24 64,12 74,30" fill="#facc15" stroke="#eab308" strokeWidth="2" />
          <circle cx="36" cy="12" r="3" fill="#ec4899" />
          <circle cx="50" cy="24" r="3.5" fill="#3b82f6" />
          <circle cx="64" cy="12" r="3" fill="#ec4899" />
          {/* Face */}
          <circle cx="50" cy="56" r="26" fill="#fed7aa" />
          {/* Dramatic fluttery eyelashes */}
          <path d="M34 50 Q41 45 47 50" stroke="#0f172a" strokeWidth="3" fill="none" />
          <line x1="36" y1="47" x2="33" y2="43" stroke="#0f172a" strokeWidth="2" />
          <line x1="41" y1="46" x2="40" y2="42" stroke="#0f172a" strokeWidth="2" />
          <path d="M53 50 Q59 45 66 50" stroke="#0f172a" strokeWidth="3" fill="none" />
          <line x1="59" y1="46" x2="60" y2="42" stroke="#0f172a" strokeWidth="2" />
          <line x1="64" y1="47" x2="67" y2="43" stroke="#0f172a" strokeWidth="2" />
          {/* Gasping dramatic "O" mouth */}
          <ellipse cx="50" cy="66" rx="5" ry="7" fill="#be123c" />
          {/* Fluffy feather boa */}
          <path d="M22 76 Q50 88 78 76" stroke="#f43f5e" strokeWidth="12" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'fairy_wifi':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Router Witch'}>
          <circle cx="50" cy="50" r="48" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />
          {/* Wizard Hat with Wi-Fi antenna top */}
          <polygon points="50,14 30,42 70,42" fill="#4338ca" />
          <ellipse cx="50" cy="42" rx="28" ry="7" fill="#312e81" />
          <circle cx="50" cy="14" r="4" fill="#22c55e" />
          {/* Wi-Fi Waves radiating from antenna */}
          <path d="M42 9 Q50 4 58 9" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M36 4 Q50 -2 64 4" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Face */}
          <circle cx="50" cy="60" r="24" fill="#ffedd5" />
          <circle cx="42" cy="57" r="3.5" fill="#0f172a" />
          <circle cx="58" cy="57" r="3.5" fill="#0f172a" />
          <path d="M44 70 Q50 76 56 70" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Glowing Ethernet / Reset button badge */}
          <rect x="36" y="80" width="28" height="12" rx="6" fill="#1e293b" />
          <text x="50" y="89" textAnchor="middle" fontSize="7" fontWeight="900" fill="#22c55e" fontFamily="sans-serif">REBOOT</text>
        </svg>
      );

    // ------------------------------------------------------------------
    // SUPERHEROES
    // ------------------------------------------------------------------
    case 'hero_borscht':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Captain Borscht'}>
          <circle cx="50" cy="50" r="48" fill="#ffe4e6" stroke="#e11d48" strokeWidth="3" />
          {/* Chef Hat with hero star */}
          <path d="M34 35 C30 18, 70 18, 66 35 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="34" y="32" width="32" height="10" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          <polygon points="50,33 52,37 56,37 53,39 54,43 50,41 46,43 47,39 44,37 48,37" fill="#e11d48" />
          {/* Head & Red Hero Mask */}
          <circle cx="50" cy="56" r="25" fill="#fed7aa" />
          <path d="M28 50 Q50 56 72 50 Q74 62 50 62 Q26 62 28 50 Z" fill="#e11d48" />
          <ellipse cx="40" cy="54" rx="4" ry="3" fill="#ffffff" />
          <ellipse cx="60" cy="54" rx="4" ry="3" fill="#ffffff" />
          {/* Determined Hero Smile */}
          <path d="M43 68 Q50 74 57 68" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Golden soup ladle in hand */}
          <line x1="72" y1="85" x2="84" y2="45" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="85" cy="43" rx="8" ry="6" fill="#f59e0b" />
        </svg>
      );

    case 'hero_wonder_savta':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Wonder Savta'}>
          <circle cx="50" cy="50" r="48" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
          {/* Golden Tiara with Red Star */}
          <polygon points="26,38 50,22 74,38" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
          <polygon points="50,28 51.5,31.5 55,31.5 52,33.5 53,37 50,35 47,37 48,33.5 45,31.5 48.5,31.5" fill="#dc2626" />
          {/* Grey Stylish Coiffure */}
          <circle cx="50" cy="54" r="25" fill="#fecdd3" />
          <path d="M25 44 C25 24, 75 24, 75 44 C65 34, 35 34, 25 44 Z" fill="#94a3b8" />
          {/* Chic red spectacles */}
          <circle cx="41" cy="52" r="7" fill="none" stroke="#dc2626" strokeWidth="2.5" />
          <circle cx="59" cy="52" r="7" fill="none" stroke="#dc2626" strokeWidth="2.5" />
          <line x1="48" y1="52" x2="52" y2="52" stroke="#dc2626" strokeWidth="2.5" />
          <circle cx="41" cy="52" r="2.5" fill="#0f172a" />
          <circle cx="59" cy="52" r="2.5" fill="#0f172a" />
          {/* Broad confident smile */}
          <path d="M42 66 Q50 74 58 66" stroke="#991b1b" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Muscular flexed arm with bracelet */}
          <g transform="translate(10, 58)">
            <path d="M12 25 C12 12, 2 15, 2 5 C12 2, 20 15, 20 25 Z" fill="#fecdd3" stroke="#b45309" strokeWidth="1.5" />
            <rect x="5" y="10" width="10" height="6" rx="2" fill="#fbbf24" stroke="#92400e" strokeWidth="1" />
          </g>
        </svg>
      );

    case 'hero_couch':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Couch Hero'}>
          <circle cx="50" cy="50" r="48" fill="#dbeafe" stroke="#2563eb" strokeWidth="3" />
          {/* Masked Hero Head */}
          <circle cx="50" cy="46" r="25" fill="#fed7aa" />
          {/* Blue Hero Cowl */}
          <path d="M25 40 C25 18, 75 18, 75 40 C75 58, 68 62, 50 62 C32 62, 25 58, 25 40 Z" fill="#2563eb" />
          {/* Slanted heroic eye cutouts */}
          <polygon points="34,42 46,46 44,50 36,48" fill="#ffffff" />
          <polygon points="66,42 54,46 56,50 64,48" fill="#ffffff" />
          {/* Mouth grinning */}
          <path d="M44 56 Q50 60 56 56" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* TV Remote Blaster in hand */}
          <g transform="translate(35, 66)">
            <rect x="0" y="0" width="30" height="18" rx="4" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="8" cy="9" r="3" fill="#ef4444" />
            <circle cx="16" cy="9" r="2.5" fill="#3b82f6" />
            <circle cx="22" cy="9" r="2.5" fill="#22c55e" />
          </g>
          {/* Laser beam shooting */}
          <polygon points="66,74 92,66 94,82" fill="#facc15" opacity="0.8" />
        </svg>
      );

    case 'hero_laundry':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Laundry Batman'}>
          <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
          {/* Bat Cowl with Laundry Pegs on Ears */}
          <polygon points="30,50 24,16 42,34" fill="#334155" />
          <polygon points="70,50 76,16 58,34" fill="#334155" />
          {/* Yellow Laundry Pegs clipped to bat ears */}
          <rect x="22" y="14" width="6" height="12" rx="2" fill="#facc15" />
          <rect x="72" y="14" width="6" height="12" rx="2" fill="#facc15" />
          {/* Cowl Face */}
          <circle cx="50" cy="54" r="26" fill="#334155" />
          {/* Stern white eye slits */}
          <polygon points="34,48 46,51 44,54 36,52" fill="#ffffff" />
          <polygon points="66,48 54,51 56,54 64,52" fill="#ffffff" />
          {/* Face cutout showing jaw */}
          <polygon points="40,64 60,64 56,76 44,76" fill="#fed7aa" />
          <line x1="46" y1="70" x2="54" y2="70" stroke="#7c2d12" strokeWidth="2" />
          {/* Steaming Iron */}
          <g transform="translate(62, 68)">
            <polygon points="0,16 20,16 16,6 6,6" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
            <path d="M4 6 L4 0 L14 0" fill="none" stroke="#ef4444" strokeWidth="2" />
          </g>
        </svg>
      );

    case 'hero_hug':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Super Hugger'}>
          <circle cx="50" cy="50" r="48" fill="#ffedd5" stroke="#f97316" strokeWidth="3" />
          {/* Big happy smiling head */}
          <circle cx="50" cy="46" r="26" fill="#fed7aa" />
          {/* Glowing heart on chest */}
          <path d="M50 78 C40 68, 30 74, 38 86 L50 96 L62 86 C70 74, 60 68, 50 78 Z" fill="#ef4444" />
          {/* Big joyful eyes */}
          <circle cx="41" cy="42" r="4" fill="#0f172a" />
          <circle cx="59" cy="42" r="4" fill="#0f172a" />
          {/* Cheeky huge smile */}
          <path d="M38 52 Q50 66 62 52" stroke="#9a3412" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Huge outstretched cartoon hugging arms */}
          <path d="M12 58 C12 36, 30 46, 32 54" stroke="#ea580c" strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="12" cy="58" r="7" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
          <path d="M88 58 C88 36, 70 46, 68 54" stroke="#ea580c" strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="88" cy="58" r="7" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
        </svg>
      );

    case 'hero_uber':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Family Uber'}>
          <circle cx="50" cy="50" r="48" fill="#fef9c3" stroke="#eab308" strokeWidth="3" />
          {/* Aviator pilot cap & goggles */}
          <circle cx="50" cy="52" r="26" fill="#fed7aa" />
          <path d="M26 44 C26 24, 74 24, 74 44 Z" fill="#78350f" />
          {/* Aviator goggles */}
          <rect x="30" y="34" width="18" height="14" rx="5" fill="#38bdf8" stroke="#1e293b" strokeWidth="2.5" />
          <rect x="52" y="34" width="18" height="14" rx="5" fill="#38bdf8" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="48" y1="41" x2="52" y2="41" stroke="#1e293b" strokeWidth="3" />
          {/* Confident grin */}
          <path d="M42 62 Q50 70 58 62" stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Twirling Car Keys */}
          <g transform="translate(68, 62)">
            <circle cx="8" cy="8" r="8" fill="none" stroke="#d97706" strokeWidth="2.5" />
            <rect x="14" y="6" width="14" height="5" rx="1.5" fill="#d97706" />
            <rect x="22" y="11" width="4" height="4" fill="#d97706" />
          </g>
          {/* Speed wind lines */}
          <line x1="12" y1="46" x2="22" y2="46" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8" y1="54" x2="20" y2="54" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'hero_sweets':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Chocolate Bandit'}>
          <circle cx="50" cy="50" r="48" fill="#f3e8ff" stroke="#9333ea" strokeWidth="3" />
          {/* Zorro mask hero */}
          <circle cx="50" cy="54" r="26" fill="#fed7aa" />
          {/* Black eye bandit mask */}
          <path d="M24 46 Q50 54 76 46 Q74 58 50 58 Q26 58 24 46 Z" fill="#18181b" />
          <ellipse cx="38" cy="51" rx="4" ry="2.5" fill="#ffffff" />
          <ellipse cx="62" cy="51" rx="4" ry="2.5" fill="#ffffff" />
          {/* Giant Chocolate bar in mouth */}
          <g transform="translate(34, 62)">
            <rect x="0" y="0" width="32" height="16" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
            <line x1="10" y1="0" x2="10" y2="16" stroke="#451a03" strokeWidth="1" />
            <line x1="21" y1="0" x2="21" y2="16" stroke="#451a03" strokeWidth="1" />
            {/* Red wrapper peeling back */}
            <rect x="0" y="6" width="16" height="12" rx="1" fill="#ef4444" />
          </g>
          {/* Floating candy wrapper */}
          <polygon points="14,28 22,22 22,34" fill="#ec4899" />
          <circle cx="24" cy="28" r="5" fill="#ec4899" />
          <polygon points="34,28 26,22 26,34" fill="#ec4899" />
        </svg>
      );

    case 'hero_whatsapp':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Good Morning GIF Hero'}>
          <circle cx="50" cy="50" r="48" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
          {/* Smartphone held up with beaming glow */}
          <circle cx="50" cy="46" r="24" fill="#fed7aa" />
          {/* Cheerful happy eyes */}
          <path d="M38 42 Q42 36 46 42" stroke="#15803d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M54 42 Q58 36 62 42" stroke="#15803d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M44 52 Q50 58 56 52" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Glowing Smartphone in hands */}
          <rect x="36" y="58" width="28" height="34" rx="4" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
          {/* Screen showing morning sun & hearts */}
          <rect x="39" y="62" width="22" height="24" rx="2" fill="#fef08a" />
          <circle cx="50" cy="72" r="5" fill="#f59e0b" />
          <text x="50" y="83" textAnchor="middle" fontSize="6" fontWeight="900" fill="#b45309" fontFamily="sans-serif">BOKER!</text>
          {/* Floating hearts and flower sparkles */}
          <text x="14" y="32" fontSize="14">🌸</text>
          <text x="74" y="36" fontSize="14">❤️</text>
          <text x="76" y="72" fontSize="14">☕</text>
        </svg>
      );

    // ------------------------------------------------------------------
    // HILARIOUS ANIMALS
    // ------------------------------------------------------------------
    case 'animal_cat_boss':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Cat Boss'}>
          <circle cx="50" cy="50" r="48" fill="#f1f5f9" stroke="#475569" strokeWidth="3" />
          {/* Cat Ears */}
          <polygon points="26,44 20,18 42,30" fill="#1e293b" />
          <polygon points="26,38 23,24 36,31" fill="#fda4af" />
          <polygon points="74,44 80,18 58,30" fill="#1e293b" />
          <polygon points="74,38 77,24 64,31" fill="#fda4af" />
          {/* Round Tuxedo Cat Face */}
          <circle cx="50" cy="54" r="28" fill="#1e293b" />
          <ellipse cx="50" cy="62" rx="16" ry="14" fill="#ffffff" />
          {/* Judgmental raised eyebrow eyes */}
          <ellipse cx="38" cy="48" rx="5" ry="3.5" fill="#facc15" />
          <ellipse cx="62" cy="46" rx="5" ry="5" fill="#facc15" />
          <line x1="32" y1="42" x2="44" y2="44" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="58" y1="38" x2="68" y2="40" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          {/* Slit pupils */}
          <line x1="38" y1="46" x2="38" y2="50" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <line x1="62" y1="43" x2="62" y2="49" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          {/* Cat Nose & Mouth */}
          <polygon points="50,56 47,53 53,53" fill="#fda4af" />
          <path d="M47 56 Q44 60 41 58 M53 56 Q56 60 59 58" stroke="#000000" strokeWidth="1.5" fill="none" />
          {/* Red CEO Necktie */}
          <polygon points="50,68 54,72 50,94 46,72" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
        </svg>
      );

    case 'animal_doge_party':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Party Pup'}>
          <circle cx="50" cy="50" r="48" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />
          {/* Striped Party Cone Hat */}
          <polygon points="50,8 36,36 64,36" fill="#f43f5e" />
          <line x1="41" y1="26" x2="59" y2="26" stroke="#fef08a" strokeWidth="3" />
          <circle cx="50" cy="8" r="4" fill="#facc15" />
          {/* Floppy Dog Ears */}
          <ellipse cx="24" cy="52" rx="10" ry="20" fill="#d97706" transform="rotate(-15 24 52)" />
          <ellipse cx="76" cy="52" rx="10" ry="20" fill="#d97706" transform="rotate(15 76 52)" />
          {/* Golden Retriever Head */}
          <circle cx="50" cy="56" r="26" fill="#fbbf24" />
          {/* Excited Eyes */}
          <circle cx="41" cy="48" r="4" fill="#000000" />
          <circle cx="42" cy="47" r="1.5" fill="#ffffff" />
          <circle cx="59" cy="48" r="4" fill="#000000" />
          <circle cx="60" cy="47" r="1.5" fill="#ffffff" />
          {/* Big Black Nose */}
          <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#1e293b" />
          {/* Party Blower in mouth */}
          <path d="M50 64 Q68 64 78 56 Q84 52 90 56" stroke="#ec4899" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Happy Tongue */}
          <path d="M46 64 C46 74, 54 74, 54 64 Z" fill="#f43f5e" />
          <text x="12" y="32" fontSize="14">🎉</text>
        </svg>
      );

    case 'animal_lazy_panda':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Lazy Panda'}>
          <circle cx="50" cy="50" r="48" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
          {/* Black Ears */}
          <circle cx="26" cy="34" r="10" fill="#1e293b" />
          <circle cx="74" cy="34" r="10" fill="#1e293b" />
          {/* Squishy flat panda face */}
          <ellipse cx="50" cy="56" rx="30" ry="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          {/* Famous black panda eye patches */}
          <ellipse cx="36" cy="52" rx="9" ry="7" fill="#1e293b" transform="rotate(-15 36 52)" />
          <ellipse cx="64" cy="52" rx="9" ry="7" fill="#1e293b" transform="rotate(15 64 52)" />
          {/* Sleepy squinty white eyes inside patches */}
          <line x1="33" y1="52" x2="40" y2="52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="52" x2="67" y2="52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          {/* Little nose & drooling smile */}
          <polygon points="50,60 47,57 53,57" fill="#1e293b" />
          <path d="M46 64 Q50 68 54 64" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="56" cy="69" r="2" fill="#38bdf8" />
          {/* Bamboo leaf resting on head */}
          <path d="M44 26 Q50 20 62 24 Q52 30 44 26 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
        </svg>
      );

    case 'animal_fox_schemer':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Schemer Fox'}>
          <circle cx="50" cy="50" r="48" fill="#ffedd5" stroke="#ea580c" strokeWidth="3" />
          {/* Big Pointy Fox Ears */}
          <polygon points="24,42 16,14 40,26" fill="#ea580c" />
          <polygon points="24,36 19,20 34,28" fill="#1e293b" />
          <polygon points="76,42 84,14 60,26" fill="#ea580c" />
          <polygon points="76,36 81,20 66,28" fill="#1e293b" />
          {/* Pointy Fox Face */}
          <polygon points="22,46 78,46 50,78" fill="#ea580c" />
          <polygon points="34,46 66,46 50,72" fill="#ffffff" />
          {/* Sly slanted eyes with monocle */}
          <path d="M32 44 Q38 40 44 44" stroke="#000000" strokeWidth="2.5" fill="none" />
          {/* Monocle over left eye */}
          <circle cx="62" cy="44" r="8" fill="none" stroke="#eab308" strokeWidth="2" />
          <line x1="62" y1="52" x2="68" y2="70" stroke="#eab308" strokeWidth="1.5" />
          <circle cx="62" cy="44" r="3" fill="#000000" />
          {/* Black Nose */}
          <circle cx="50" cy="76" r="4" fill="#000000" />
          <text x="76" y="80" fontSize="13" fontWeight="900" fill="#b45309">%</text>
        </svg>
      );

    case 'animal_cake_bear':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Cake Bear'}>
          <circle cx="50" cy="50" r="48" fill="#fed7aa" stroke="#c2410c" strokeWidth="3" />
          {/* Bear Ears */}
          <circle cx="26" cy="30" r="10" fill="#78350f" />
          <circle cx="26" cy="30" r="6" fill="#fbcfe8" />
          <circle cx="74" cy="30" r="10" fill="#78350f" />
          <circle cx="74" cy="30" r="6" fill="#fbcfe8" />
          {/* Brown Bear Face */}
          <circle cx="50" cy="54" r="28" fill="#92400e" />
          <ellipse cx="50" cy="64" rx="16" ry="12" fill="#fde68a" />
          {/* Wide round happy eyes */}
          <circle cx="40" cy="48" r="4" fill="#ffffff" />
          <circle cx="40" cy="48" r="2" fill="#000000" />
          <circle cx="60" cy="48" r="4" fill="#ffffff" />
          <circle cx="60" cy="48" r="2" fill="#000000" />
          {/* Pink frosting all over muzzle! */}
          <path d="M40 60 C42 56, 58 56, 60 60 C58 72, 42 72, 40 60 Z" fill="#f472b6" />
          <circle cx="50" cy="59" r="3.5" fill="#1e293b" />
          {/* Cake crumbs */}
          <circle cx="44" cy="65" r="1.5" fill="#78350f" />
          <circle cx="54" cy="66" r="1.5" fill="#78350f" />
          <circle cx="48" cy="67" r="1" fill="#78350f" />
        </svg>
      );

    case 'animal_drama_llama':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Drama Llama'}>
          <circle cx="50" cy="50" r="48" fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />
          {/* Tall cute llama ears */}
          <polygon points="36,36 30,10 44,22" fill="#ffffff" stroke="#d4d4d8" strokeWidth="1.5" />
          <polygon points="64,36 70,10 56,22" fill="#ffffff" stroke="#d4d4d8" strokeWidth="1.5" />
          {/* Fluffy head coiffure */}
          <circle cx="50" cy="34" r="14" fill="#ffffff" />
          <circle cx="40" cy="34" r="10" fill="#ffffff" />
          <circle cx="60" cy="34" r="10" fill="#ffffff" />
          {/* Llama face */}
          <rect x="36" y="36" width="28" height="34" rx="14" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1.5" />
          {/* Cool retro sunglasses */}
          <rect x="34" y="44" width="14" height="10" rx="3" fill="#be185d" />
          <rect x="52" y="44" width="14" height="10" rx="3" fill="#be185d" />
          <line x1="48" y1="48" x2="52" y2="48" stroke="#be185d" strokeWidth="2" />
          {/* Shocked open 'O' mouth */}
          <ellipse cx="50" cy="62" rx="4" ry="6" fill="#18181b" />
          {/* Colorful Peruvian Pom-Pom collar */}
          <circle cx="32" cy="80" r="5" fill="#ef4444" />
          <circle cx="44" cy="84" r="5" fill="#3b82f6" />
          <circle cx="56" cy="84" r="5" fill="#10b981" />
          <circle cx="68" cy="80" r="5" fill="#f59e0b" />
        </svg>
      );

    case 'animal_owl_detective':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Detective Owl'}>
          <circle cx="50" cy="50" r="48" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          {/* Sherlock Plaid Hat */}
          <ellipse cx="50" cy="32" rx="26" ry="10" fill="#78350f" />
          <path d="M30 32 C30 18, 70 18, 70 32 Z" fill="#92400e" />
          {/* Round Owl Body */}
          <circle cx="50" cy="58" r="28" fill="#475569" />
          <ellipse cx="50" cy="66" rx="16" ry="16" fill="#f8fafc" />
          {/* Giant Owl Eyes with Glasses */}
          <circle cx="38" cy="50" r="10" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
          <circle cx="38" cy="50" r="5" fill="#0f172a" />
          <circle cx="39" cy="48" r="1.5" fill="#ffffff" />
          <circle cx="62" cy="50" r="10" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
          <circle cx="62" cy="50" r="5" fill="#0f172a" />
          <circle cx="63" cy="48" r="1.5" fill="#ffffff" />
          {/* Orange Beak */}
          <polygon points="50,56 46,52 54,52" fill="#f97316" />
          {/* Magnifying Glass held up */}
          <circle cx="76" cy="68" r="8" fill="none" stroke="#d97706" strokeWidth="2" />
          <line x1="70" y1="74" x2="64" y2="84" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'animal_chimp_selfie':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Selfie Monkey'}>
          <circle cx="50" cy="50" r="48" fill="#d1fae5" stroke="#059669" strokeWidth="3" />
          {/* Big Chimp Ears */}
          <circle cx="20" cy="50" r="12" fill="#b45309" />
          <circle cx="20" cy="50" r="7" fill="#fed7aa" />
          <circle cx="80" cy="50" r="12" fill="#b45309" />
          <circle cx="80" cy="50" r="7" fill="#fed7aa" />
          {/* Chimp Head */}
          <circle cx="50" cy="50" r="26" fill="#78350f" />
          <ellipse cx="50" cy="60" rx="18" ry="14" fill="#fed7aa" />
          {/* Eyes looking directly at camera */}
          <circle cx="42" cy="44" r="4" fill="#000000" />
          <circle cx="43" cy="43" r="1" fill="#ffffff" />
          <circle cx="58" cy="44" r="4" fill="#000000" />
          <circle cx="59" cy="43" r="1" fill="#ffffff" />
          {/* Giant Goofy Smile with teeth */}
          <path d="M38 58 Q50 72 62 58 Z" fill="#ffffff" stroke="#7c2d12" strokeWidth="2" />
          <line x1="44" y1="58" x2="44" y2="65" stroke="#fed7aa" strokeWidth="1" />
          <line x1="50" y1="58" x2="50" y2="66" stroke="#fed7aa" strokeWidth="1" />
          <line x1="56" y1="58" x2="56" y2="65" stroke="#fed7aa" strokeWidth="1" />
          {/* ✌️ Peace sign hand */}
          <g transform="translate(10, 68)">
            <rect x="4" y="0" width="4" height="12" rx="2" fill="#fed7aa" />
            <rect x="10" y="2" width="4" height="10" rx="2" fill="#fed7aa" />
            <ellipse cx="8" cy="12" rx="6" ry="5" fill="#fed7aa" />
          </g>
        </svg>
      );

    // ------------------------------------------------------------------
    // SOVIET & NOSTALGIA
    // ------------------------------------------------------------------
    case 'ussr_babushka_pin':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Babushka with Rolling Pin'}>
          <circle cx="50" cy="50" r="48" fill="#ffe4e6" stroke="#e11d48" strokeWidth="3" />
          {/* Red Floral Babushka Scarf (Platok) */}
          <circle cx="50" cy="52" r="30" fill="#e11d48" />
          <circle cx="34" cy="38" r="3" fill="#facc15" />
          <circle cx="66" cy="38" r="3" fill="#facc15" />
          <circle cx="50" cy="28" r="3" fill="#facc15" />
          {/* Face cutout */}
          <circle cx="50" cy="52" r="20" fill="#ffedd5" />
          {/* Rosy cheeks */}
          <circle cx="38" cy="55" r="4.5" fill="#fb7185" opacity="0.8" />
          <circle cx="62" cy="55" r="4.5" fill="#fb7185" opacity="0.8" />
          {/* Warm grandmother eyes */}
          <path d="M40 47 Q44 43 48 47" stroke="#7f1d1d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M52 47 Q56 43 60 47" stroke="#7f1d1d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Loving smile */}
          <path d="M45 60 Q50 64 55 60" stroke="#7f1d1d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Scarf knot under chin */}
          <polygon points="50,72 44,80 56,80" fill="#be123c" />
          {/* Wooden Rolling Pin held high */}
          <g transform="translate(68, 55) rotate(-35)">
            <rect x="0" y="4" width="8" height="30" rx="3" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
            <rect x="2" y="0" width="4" height="4" rx="1" fill="#92400e" />
            <rect x="2" y="34" width="4" height="4" rx="1" fill="#92400e" />
          </g>
        </svg>
      );

    case 'ussr_mishka_80':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Olympic Mishka 1980'}>
          <circle cx="50" cy="50" r="48" fill="#dbeafe" stroke="#2563eb" strokeWidth="3" />
          {/* Bear Ears */}
          <circle cx="28" cy="28" r="10" fill="#92400e" />
          <circle cx="28" cy="28" r="6" fill="#fde68a" />
          <circle cx="72" cy="28" r="10" fill="#92400e" />
          <circle cx="72" cy="28" r="6" fill="#fde68a" />
          {/* Mishka Head */}
          <circle cx="50" cy="52" r="26" fill="#92400e" />
          <ellipse cx="50" cy="62" rx="16" ry="12" fill="#fde68a" />
          {/* Gentle big brown eyes */}
          <ellipse cx="40" cy="48" rx="4" ry="5" fill="#1e293b" />
          <circle cx="41" cy="46" r="1.5" fill="#ffffff" />
          <ellipse cx="60" cy="48" rx="4" ry="5" fill="#1e293b" />
          <circle cx="61" cy="46" r="1.5" fill="#ffffff" />
          {/* The famous happy tear of 1980 */}
          <path d="M66 52 Q68 57 66 60 Q64 57 66 52 Z" fill="#38bdf8" />
          {/* Cute black nose & smile */}
          <polygon points="50,58 46,54 54,54" fill="#000000" />
          <path d="M45 62 Q50 67 55 62" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Olympic 5-Ring Belt */}
          <rect x="30" y="76" width="40" height="10" rx="3" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="1.5" />
          <circle cx="42" cy="81" r="2.5" fill="none" stroke="#fbbf24" strokeWidth="1" />
          <circle cx="48" cy="81" r="2.5" fill="none" stroke="#fbbf24" strokeWidth="1" />
          <circle cx="54" cy="81" r="2.5" fill="none" stroke="#fbbf24" strokeWidth="1" />
        </svg>
      );

    case 'ussr_wolf_pogodi':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Nu Pogodi Wolf'}>
          <circle cx="50" cy="50" r="48" fill="#bae6fd" stroke="#0284c7" strokeWidth="3" />
          {/* Wolf messy hair */}
          <path d="M30 36 C25 15, 60 18, 70 32 Z" fill="#0f172a" />
          {/* Wolf snout & face */}
          <circle cx="46" cy="46" r="22" fill="#64748b" />
          <polygon points="46,42 78,54 46,62" fill="#64748b" />
          {/* Big black nose tip */}
          <circle cx="78" cy="54" r="5" fill="#000000" />
          {/* Sly eyes */}
          <circle cx="40" cy="42" r="4.5" fill="#facc15" />
          <circle cx="40" cy="42" r="2" fill="#000000" />
          <circle cx="52" cy="42" r="4.5" fill="#facc15" />
          <circle cx="52" cy="42" r="2" fill="#000000" />
          {/* Toothy grin with cigarette/matchstick */}
          <polygon points="56,58 60,63 56,63" fill="#ffffff" />
          <line x1="56" y1="62" x2="68" y2="68" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="68" cy="68" r="1.5" fill="#ef4444" />
          {/* Sailor striped shirt (Telnyashka) */}
          <rect x="24" y="68" width="52" height="26" rx="6" fill="#ffffff" stroke="#1e40af" strokeWidth="2" />
          <line x1="24" y1="74" x2="76" y2="74" stroke="#1e40af" strokeWidth="3" />
          <line x1="24" y1="82" x2="76" y2="82" stroke="#1e40af" strokeWidth="3" />
          <line x1="24" y1="90" x2="76" y2="90" stroke="#1e40af" strokeWidth="3" />
        </svg>
      );

    case 'ussr_gena_accordion':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Gena Crocodile'}>
          <circle cx="50" cy="50" r="48" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
          {/* Small brown fedora hat */}
          <ellipse cx="44" cy="24" rx="14" ry="4" fill="#78350f" />
          <rect x="36" y="14" width="16" height="10" rx="3" fill="#92400e" />
          {/* Green Crocodile Snout & Head */}
          <circle cx="42" cy="42" r="18" fill="#15803d" />
          <polygon points="40,36 78,44 40,54" fill="#15803d" />
          <circle cx="76" cy="44" r="2.5" fill="#14532d" />
          {/* Kind gentle eyes */}
          <circle cx="38" cy="36" r="3.5" fill="#ffffff" />
          <circle cx="39" cy="36" r="1.5" fill="#000000" />
          {/* Polite smile */}
          <path d="M46 50 Q60 52 70 47" stroke="#14532d" strokeWidth="2" fill="none" />
          {/* Red Coat Collar & Bow Tie */}
          <path d="M26 62 Q50 68 74 62 L74 94 L26 94 Z" fill="#b91c1c" />
          <polygon points="50,62 44,58 44,66" fill="#18181b" />
          <polygon points="50,62 56,58 56,66" fill="#18181b" />
          {/* Accordion in front */}
          <g transform="translate(30, 68)">
            <rect x="0" y="0" width="8" height="24" rx="2" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
            {/* Bellows */}
            <path d="M8 2 L12 0 L16 2 L20 0 L24 2 L28 0 L32 2 L32 22 L28 24 L24 22 L20 24 L16 22 L12 24 L8 22 Z" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
            <rect x="32" y="0" width="8" height="24" rx="2" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case 'ussr_cheburashka':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Cheburashka'}>
          <circle cx="50" cy="50" r="48" fill="#ffedd5" stroke="#ea580c" strokeWidth="3" />
          {/* Huge iconic round fuzzy ears */}
          <circle cx="20" cy="46" r="18" fill="#78350f" />
          <circle cx="20" cy="46" r="12" fill="#d97706" />
          <circle cx="80" cy="46" r="18" fill="#78350f" />
          <circle cx="80" cy="46" r="12" fill="#d97706" />
          {/* Round head */}
          <circle cx="50" cy="50" r="22" fill="#78350f" />
          <circle cx="50" cy="52" r="16" fill="#fed7aa" />
          {/* Big innocent sweet eyes */}
          <circle cx="43" cy="48" r="5" fill="#000000" />
          <circle cx="44" cy="46" r="2" fill="#ffffff" />
          <circle cx="57" cy="48" r="5" fill="#000000" />
          <circle cx="58" cy="46" r="2" fill="#ffffff" />
          {/* Cute triangle nose & tiny smile */}
          <polygon points="50,54 48,51 52,51" fill="#78350f" />
          <path d="M47 57 Q50 60 53 57" stroke="#78350f" strokeWidth="1.5" fill="none" />
          {/* Hugging a big juicy orange */}
          <circle cx="50" cy="78" r="15" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
          <circle cx="50" cy="65" r="1.5" fill="#15803d" />
        </svg>
      );

    case 'ussr_shapoklyak':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Shapoklyak'}>
          <circle cx="50" cy="50" r="48" fill="#f3e8ff" stroke="#7e22ce" strokeWidth="3" />
          {/* Vintage Pillbox Hat with ribbon */}
          <rect x="36" y="20" width="28" height="12" rx="4" fill="#1e1b4b" />
          <line x1="32" y1="32" x2="68" y2="32" stroke="#1e1b4b" strokeWidth="3" />
          {/* Grey hair bun */}
          <circle cx="50" cy="36" r="14" fill="#cbd5e1" />
          {/* Cunning long-nosed face */}
          <circle cx="48" cy="52" r="20" fill="#ffedd5" />
          <polygon points="46,48 68,54 46,58" fill="#ffedd5" stroke="#fbcfe8" strokeWidth="1" />
          {/* Sly squinting eyes */}
          <line x1="38" y1="46" x2="44" y2="48" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <line x1="48" y1="48" x2="54" y2="46" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <path d="M42 62 Q50 66 56 60" stroke="#701a75" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Umbrella handle */}
          <path d="M26 60 L26 84 C26 90, 20 90, 20 84" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Pet Rat Lariska peeking out */}
          <g transform="translate(68, 62)">
            <ellipse cx="10" cy="10" rx="8" ry="6" fill="#64748b" />
            <circle cx="15" cy="8" r="1.5" fill="#000000" />
            <polygon points="18,10 16,9 16,11" fill="#fda4af" />
          </g>
        </svg>
      );

    case 'ussr_bag_of_bags':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Bag of Bags Lady'}>
          <circle cx="50" cy="50" r="48" fill="#fef9c3" stroke="#ca8a04" strokeWidth="3" />
          {/* Lady head with pearl earrings */}
          <circle cx="50" cy="40" r="22" fill="#fed7aa" />
          <path d="M28 36 C28 16, 72 16, 72 36 Z" fill="#92400e" />
          <circle cx="28" cy="44" r="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="72" cy="44" r="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="42" cy="38" r="3" fill="#000000" />
          <circle cx="58" cy="38" r="3" fill="#000000" />
          <path d="M44 48 Q50 54 56 48" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* The Sacred GIANT plastic bag bulging with 500 bags */}
          <g transform="translate(24, 52)">
            <rect x="0" y="8" width="52" height="34" rx="8" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
            <path d="M14 8 C14 -2, 38 -2, 38 8" fill="none" stroke="#1d4ed8" strokeWidth="3" />
            {/* Multi-colored bag handles spilling out */}
            <path d="M8 8 Q14 2 20 8" stroke="#ef4444" strokeWidth="2.5" fill="none" />
            <path d="M18 8 Q26 0 34 8" stroke="#facc15" strokeWidth="2.5" fill="none" />
            <path d="M30 8 Q38 2 46 8" stroke="#22c55e" strokeWidth="2.5" fill="none" />
            <text x="26" y="28" textAnchor="middle" fontSize="7" fontWeight="900" fill="#ffffff" fontFamily="sans-serif">ПАКЕТЫ</text>
          </g>
        </svg>
      );

    case 'ussr_cosmonaut':
      return (
        <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title || 'Soviet Cosmonaut'}>
          <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="#ef4444" strokeWidth="3" />
          {/* Big White Soviet Space Helmet */}
          <circle cx="50" cy="48" r="32" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          {/* CCCP in red on forehead */}
          <text x="50" y="27" textAnchor="middle" fontSize="9" fontWeight="900" fill="#dc2626" fontFamily="sans-serif" letterSpacing="1">СССР</text>
          {/* Glass Visor reflecting deep space */}
          <circle cx="50" cy="52" r="21" fill="#1e1b4b" stroke="#64748b" strokeWidth="1.5" />
          {/* Happy face inside visor */}
          <circle cx="50" cy="52" r="16" fill="#fed7aa" />
          <circle cx="44" cy="48" r="2.5" fill="#000000" />
          <circle cx="56" cy="48" r="2.5" fill="#000000" />
          <path d="M46 57 Q50 62 54 57" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Classic Waffle Cone Ice Cream (Plombir) held up */}
          <g transform="translate(68, 54)">
            <polygon points="12,24 6,40 18,40" fill="#d97706" />
            <circle cx="12" cy="22" r="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="7" y="26" width="10" height="6" fill="#dc2626" rx="1" />
            <text x="12" y="31" textAnchor="middle" fontSize="4" fontWeight="900" fill="#ffffff" fontFamily="sans-serif">20к</text>
          </g>
        </svg>
      );

    // ------------------------------------------------------------------
    // FALLBACK FOR SYSTEM EMOJI OR LEGACY STRINGS
    // ------------------------------------------------------------------
    default:
      return (
        <span
          className={`inline-flex items-center justify-center select-none leading-none ${className}`}
          title={title}
          role="img"
          aria-label={title || avatar}
        >
          {avatar}
        </span>
      );
  }
};

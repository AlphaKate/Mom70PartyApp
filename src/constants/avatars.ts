import { Language } from '../types/game';

export type AvatarCategoryKey = 'fairies' | 'superheroes' | 'animals' | 'ussr';

export interface AvatarItem {
  id: string;
  category: AvatarCategoryKey;
  names: Record<Language, string>;
}

export interface AvatarCategory {
  key: AvatarCategoryKey;
  icon: string;
  labels: Record<Language, string>;
  avatars: AvatarItem[];
}

export const AVATAR_CATEGORIES: AvatarCategory[] = [
  {
    key: 'fairies',
    icon: 'fairy_nap',
    labels: {
      he: 'פיות וקסם',
      ru: 'Феи и магия',
      en: 'Fairies & Magic',
    },
    avatars: [
      {
        id: 'fairy_nap',
        category: 'fairies',
        names: {
          he: 'פיית השנ״צ הקדוש',
          ru: 'Фея святого дневного сна',
          en: 'Holy Power-Nap Fairy',
        },
      },
      {
        id: 'fairy_cash',
        category: 'fairies',
        names: {
          he: 'פיית המזומנים והשופינג',
          ru: 'Фея шопинга и заначки',
          en: 'Cash & Shopping Fairy',
        },
      },
      {
        id: 'fairy_told_you',
        category: 'fairies',
        names: {
          he: 'פיית ה״אמרתי לכם!״',
          ru: 'Фея «А я вас предупреждала!»',
          en: 'The "I Told You So!" Fairy',
        },
      },
      {
        id: 'fairy_carb',
        category: 'fairies',
        names: {
          he: 'שדון הבורקס והפחמימות',
          ru: 'Эльф горячих пирожков',
          en: 'Pastry & Carb Gremlin',
        },
      },
      {
        id: 'fairy_espresso',
        category: 'fairies',
        names: {
          he: 'חד-קרן על 4 אספרסו',
          ru: 'Единорог на 4 эспрессо',
          en: 'Unicorn on 4 Espressos',
        },
      },
      {
        id: 'fairy_cleaner',
        category: 'fairies',
        names: {
          he: 'פיית הטורבו-אקונומיקה',
          ru: 'Фея турбо-стерильности',
          en: 'Turbo Clean-Freak Fairy',
        },
      },
      {
        id: 'fairy_drama',
        category: 'fairies',
        names: {
          he: 'נסיכת הדרמה המלכותית',
          ru: 'Принцесса драмы на ровном месте',
          en: 'Drama Queen Princess',
        },
      },
      {
        id: 'fairy_wifi',
        category: 'fairies',
        names: {
          he: 'קוסמת ה״תעשה ריסטרט לראוטר״',
          ru: 'Волшебница «Перегрузи роутер»',
          en: 'Restart-the-Router Witch',
        },
      },
    ],
  },
  {
    key: 'superheroes',
    icon: 'hero_wonder_savta',
    labels: {
      he: 'גיבורי על',
      ru: 'Супергерои',
      en: 'Superheroes',
    },
    avatars: [
      {
        id: 'hero_wonder_savta',
        category: 'superheroes',
        names: {
          he: 'וונדר-סבתא הכל-יכולה',
          ru: 'Чудо-Бабушка Всемогущая',
          en: 'Wonder-Granny Supreme',
        },
      },
      {
        id: 'hero_borscht',
        category: 'superheroes',
        names: {
          he: 'קפטן מרק עוף ובולבוסים',
          ru: 'Капитан Наваристый Борщ',
          en: 'Captain Golden Soup',
        },
      },
      {
        id: 'hero_couch',
        category: 'superheroes',
        names: {
          he: 'איש השלט והספה',
          ru: 'Человек-Диван и Властелин Пульта',
          en: 'The Couch & Remote Hero',
        },
      },
      {
        id: 'hero_laundry',
        category: 'superheroes',
        names: {
          he: 'באטמן שמקפל כביסה בחושך',
          ru: 'Бэтмен, гладящий бельё в ночи',
          en: 'Midnight Laundry Batman',
        },
      },
      {
        id: 'hero_hug',
        category: 'superheroes',
        names: {
          he: 'סופר-מחבק עד חנק',
          ru: 'Супер-Обниматель до хруста',
          en: 'Bone-Crusher Hugger',
        },
      },
      {
        id: 'hero_uber',
        category: 'superheroes',
        names: {
          he: 'טייס ההסעות המשפחתי',
          ru: 'Властелин семейной развозки',
          en: 'Family Uber Aviator',
        },
      },
      {
        id: 'hero_sweets',
        category: 'superheroes',
        names: {
          he: 'שודד השוקולדים הלילי',
          ru: 'Ночной похититель шоколадок',
          en: 'Midnight Chocolate Raider',
        },
      },
      {
        id: 'hero_whatsapp',
        category: 'superheroes',
        names: {
          he: 'השולח 50 תמונות בוקר טוב',
          ru: 'Мастер открыток «С добрым утром»',
          en: '50 "Good Morning" GIFs Hero',
        },
      },
    ],
  },
  {
    key: 'animals',
    icon: 'animal_cat_boss',
    labels: {
      he: 'חיות משעשעות',
      ru: 'Животные с характером',
      en: 'Hilarious Animals',
    },
    avatars: [
      {
        id: 'animal_cat_boss',
        category: 'animals',
        names: {
          he: 'חתול-בוס שיפוטי',
          ru: 'Кот-директор с презрением',
          en: 'Judgmental Boss Cat',
        },
      },
      {
        id: 'animal_doge_party',
        category: 'animals',
        names: {
          he: 'כלבלב במסיבה מוגזמת',
          ru: 'Пёсель в колпаке на все 100%',
          en: 'Overexcited Party Pup',
        },
      },
      {
        id: 'animal_lazy_panda',
        category: 'animals',
        names: {
          he: 'פנדה שלא קמה מהמיטה',
          ru: 'Панда: «Сегодня никуда не пойду»',
          en: 'Panda Refusing to Adult',
        },
      },
      {
        id: 'animal_fox_schemer',
        category: 'animals',
        names: {
          he: 'שועל הקומבינות וההנחות',
          ru: 'Хитрый лис с купонами',
          en: 'Coupon Master Fox',
        },
      },
      {
        id: 'animal_cake_bear',
        category: 'animals',
        names: {
          he: 'דוב שחיסל את כל העוגה',
          ru: 'Медведь, съевший весь торт',
          en: 'Bear Who Inhaled the Cake',
        },
      },
      {
        id: 'animal_drama_llama',
        category: 'animals',
        names: {
          he: 'לאמה שמתרגשת מכל שטות',
          ru: 'Шокированная драма-лама',
          en: 'Shocked Drama Llama',
        },
      },
      {
        id: 'animal_owl_detective',
        category: 'animals',
        names: {
          he: 'ינשוף שיודע מה עשיתם',
          ru: 'Сова: «Я всё про вас знаю»',
          en: 'All-Knowing Detective Owl',
        },
      },
      {
        id: 'animal_chimp_selfie',
        category: 'animals',
        names: {
          he: 'קוף שעושה סלפי לא מחמיא',
          ru: 'Обезьянка с фронталки',
          en: 'Front-Camera Selfie Monkey',
        },
      },
    ],
  },
  {
    key: 'ussr',
    icon: 'ussr_mishka_80',
    labels: {
      he: 'ברית המועצות ונוסטלגיה',
      ru: 'СССР и ностальгия',
      en: 'USSR Nostalgia',
    },
    avatars: [
      {
        id: 'ussr_mishka_80',
        category: 'ussr',
        names: {
          he: 'מישקה אולימפי שלא רוצה לעוף',
          ru: 'Олимпийский Мишка со слезой',
          en: 'Olympic Mishka 1980',
        },
      },
      {
        id: 'ussr_babushka_pin',
        category: 'ussr',
        names: {
          he: 'בבושקה חמושה במערוך',
          ru: 'Бабушка с боевой скалкой',
          en: 'Babushka with Rolling Pin',
        },
      },
      {
        id: 'ussr_gena_accordion',
        category: 'ussr',
        names: {
          he: 'קרוקודיל גנה עם גרמושקה',
          ru: 'Крокодил Гена («Пусть бегут...»)',
          en: 'Gena with Accordion',
        },
      },
      {
        id: 'ussr_cheburashka',
        category: 'ussr',
        names: {
          he: 'צ׳בורשקה עם ארגז תפוזים',
          ru: 'Чебурашка с апельсинами',
          en: 'Cheburashka with Oranges',
        },
      },
      {
        id: 'ussr_wolf_pogodi',
        category: 'ussr',
        names: {
          he: 'הזאב מ״נו, פוגודי!״',
          ru: 'Волк из «Ну, погоди!» в тельняшке',
          en: 'Nu Pogodi Sailor Wolf',
        },
      },
      {
        id: 'ussr_shapoklyak',
        category: 'ussr',
        names: {
          he: 'מדאם שאפוקליאק ולריסקה',
          ru: 'Старуха Шапокляк и Лариска',
          en: 'Madam Shapoklyak & Rat',
        },
      },
      {
        id: 'ussr_bag_of_bags',
        category: 'ussr',
        names: {
          he: 'השומרת של ״שקית השקיות״',
          ru: 'Хранительница пакета с пакетами',
          en: 'Guardian of the "Bag of Bags"',
        },
      },
      {
        id: 'ussr_cosmonaut',
        category: 'ussr',
        names: {
          he: 'קוסמונאוט שחיפש פלומביר',
          ru: 'Космонавт за пломбиром 20 коп.',
          en: 'Cosmonaut for Soviet Ice Cream',
        },
      },
    ],
  },
];

export const DEFAULT_AVATAR = AVATAR_CATEGORIES[0].avatars[0].id; // 'fairy_nap'

export const ALL_AVATAR_IDS: string[] = AVATAR_CATEGORIES.flatMap((c) =>
  c.avatars.map((a) => a.id)
);

export function findAvatarItem(avatarId: string): AvatarItem | undefined {
  for (const cat of AVATAR_CATEGORIES) {
    const item = cat.avatars.find((a) => a.id === avatarId);
    if (item) return item;
  }
  return undefined;
}

export function getAvatarDisplayName(avatarId: string, lang: Language): string {
  const item = findAvatarItem(avatarId);
  if (item && item.names[lang]) {
    return item.names[lang];
  }
  return avatarId;
}

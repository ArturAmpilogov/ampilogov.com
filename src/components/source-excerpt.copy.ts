import { defineCopy } from "@/i18n/copy";
import type { Locale } from "@/i18n/config";

export const sourceExcerptCopy = defineCopy(
  {
    openFullSource: (title: string) => `${title}: открыть полный источник`,
    sourceLinks: "Ссылки на источник",
    fullSource: "Полный источник ↗",
    sourceCard: "Карточка источника",
    highlightNote: "Фрагмент источника; подсветка строки добавлена редакцией.",
  },
  {
    en: {
      openFullSource: (title) => `${title}: open the full source`,
      sourceLinks: "Source links",
      fullSource: "Full source ↗",
      sourceCard: "Source card",
      highlightNote: "Source fragment; the line highlighting was added by the editors.",
    },
    uk: {
      openFullSource: (title) => `${title}: відкрити повне джерело`,
      sourceLinks: "Посилання на джерело",
      fullSource: "Повне джерело ↗",
      sourceCard: "Картка джерела",
      highlightNote: "Фрагмент джерела; підсвічування рядка додала редакція.",
    },
    be: {
      openFullSource: (title) => `${title}: адкрыць поўную крыніцу`,
      sourceLinks: "Спасылкі на крыніцу",
      fullSource: "Поўная крыніца ↗",
      sourceCard: "Картка крыніцы",
      highlightNote: "Фрагмент крыніцы; падсвятленне радка дадала рэдакцыя.",
    },
  },
);

export type SourceExcerptText = {
  eyebrow: string;
  title: string;
  transcription: string;
  citation: string;
};

/** Translated text of each excerpt; Russian lives with the definitions in source-excerpt.tsx. */
export const sourceExcerptTranslations: Record<Exclude<Locale, "ru">, Record<string, SourceExcerptText>> = {
  en: {
    "novgorod-menaion-amfilogiy-1097": {
      eyebrow: "Service text of 1097",
      title: "How the saint was seen in Novgorod",
      transcription: "The service calls Amphilochius (Amfilogiy) «божественным громом и трубой духовной» [“divine thunder and spiritual trumpet”], a teacher of the faithful and an opponent of heresies, and then asks for his unceasing prayer for all.",
      citation: "«Служебные минеи за сентябрь, октябрь и ноябрь» [Service Menaia for September, October and November] / ed. V. Jagić. St Petersburg: Imperial Academy of Sciences Press, 1886. P. 436; text after the Novgorod Service Menaion of 1097.",
    },
    "nikonov-ampilogov": {
      eyebrow: "Two entries on one page",
      title: "Why the forms “Anpilov” and “Anpilogov” appeared",
      transcription: "For the form Anpilov, Nikonov explains both changes separately: f → p as the borrowed name was adapted, and m → n to avoid two labial consonants side by side. He derives Anpilogov directly from the colloquial Anpilog and the church form Amfilokhiy.",
      citation: "V. A. Nikonov. «Опыт словаря русских фамилий. II» [Towards a dictionary of Russian surnames, II] // Этимология. 1971. Moscow: Nauka, 1973. P. 279.",
    },
    "tonkoy-onfilogov": {
      eyebrow: "Scholarly edition of a manuscript copy",
      title: "Tonkoy Onfilogov among the non-farming households",
      transcription: "«…а непашенных дворов: в. Некраско Данилов, в. Тонкой Онфилогов…» [“…and of non-farming households: Nekrasko Danilov, Tonkoy Onfilogov…”]",
      citation: "S. M. Kashtanov. «По следам троицких копийных книг XVI в.» [On the trail of the 16th-century Trinity copy books] // Записки отдела рукописей. Issue 40. Moscow: Kniga, 1979. P. 43, doc. no. 3 (p. 44 in the PDF).",
    },
    "pavel-anfilogov": {
      eyebrow: "Original archival leaf",
      title: "Pavel Terentyev syn Anfilogov",
      transcription: "Editorial reading of the line: «Павел Терентьев сын Анфилогов» [“Pavel, son of Terenty, Anfilogov”].",
      citation: "Russian State Archive of Ancient Acts (RGADA). F. 181. Op. 2. D. 120. L. 58 verso. Digital image 0060.",
    },
    "onfilogovo-tver-1540": {
      eyebrow: "Cadastral book of Tver district",
      title: "A village named after a man",
      transcription: "«Къ тому жъ селу деревни: дер. Онфилогово: 4 дв.; пашни въ полѣ 30 четьи, сѣна 30 коп.» [“Villages belonging to the same estate: the village of Onfilogovo, 4 households; arable land, 30 chetverts per field; hay, 30 stacks”] — the first of six villages of the estate of Nikolskoye Svechino, held by Stefanida, wife of Ivan Yurlov. The source does not say she was a widow.",
      citation: "«Писцовыя книги Московскаго государства» [Cadastral books of the Muscovite state]. Part I. Section 2 / ed. N. V. Kalachov. St Petersburg: Imperial Russian Geographical Society, 1877. P. 111. Cadastral book of 7048 (1539/40) compiled by Ivan Petrovich Zabolotsky and Mikhail Ivanov Usov-Tatishchev; manuscript: RGADA, f. 1209, op. 1, book 466.",
    },
    "anpilog-onanin-1594": {
      eyebrow: "Oryol cadastral book · 1594/95",
      title: "Anpilog: still a first name, not a surname",
      transcription: "«За Кондрашкомъ за Вавиловымъ сыномъ Онаньина, что было за дѣдомъ его за Анпилогомъ (sic) за Ивановымъ сыномъ Онаньина въ тойже дер. на Государнинѣ селищѣ, на р. на Орлѣ, подъ Корчаковымъ лѣсомъ…» [“Held by Kondrashko, son of Vavila, Onanyin, which had been held by his grandfather Anpilog (sic), son of Ivan, Onanyin, in the same village on the Gosudarnino site, on the river Orel, below the Korchakov forest…”]",
      citation: "«Писцовыя книги Московскаго государства» [Cadastral books of the Muscovite state]. Part I. Section 2 / ed. N. V. Kalachov. St Petersburg, 1877. P. 948; Oryol district, Korchakov stan. The “(sic)” mark is the editor’s. Manuscript: RGADA, f. 1209, op. 1, d. 329; old MAMYu shelfmark no. 399.",
    },
    "nes-anfilogovy": {
      eyebrow: "Encyclopedia entry of 1911",
      title: "A noble family, Vasily Dmitriyevich and Part VI",
      transcription: "«Анфилоговы (в старину также Анпилоговы и Онпилоговы), русский дворянский род, ведущий начало от Василия Дмитриевича А., „записанного по городу Орлу московского стола в десятках“. Род А. записан в VI ч. род. кн. Курской губ.» [“The Anfilogovs (in old times also Anpilogovs and Onpilogovs), a Russian noble family descending from Vasily Dmitriyevich A., ‘recorded under the town of Orel of the Moscow desk in the muster rolls’. The family is entered in Part VI of the genealogical book of Kursk province.”]",
      citation: "«Новый энциклопедический словарь» [New Encyclopedic Dictionary] / ed. K. K. Arsenyev. St Petersburg: F. A. Brockhaus, I. A. Efron, 1911. Vol. 3. Col. 108.",
    },
    "savelov-anfilogovy": {
      eyebrow: "Genealogical reference of 1906",
      title: "The early Anfilogovs, Anpilogovs and Onpilogovs",
      transcription: "«Анфилоговы, в старину также Анпилоговы, Онпилоговы. Василий, Тимофей и Карп Микуловичи, Беляй Васильевич, Иван Першин, Иван Нечаев, Софон Тимофеевич и Ермак Пахомович А. в 1594 г. владели поместьями в Корчаковском стану Орловского у. Василий Семенович О. в 1628 г. был верстан новичным окладом по Курску. Иван Анпилогов, старооскольский сын боярский, в 1695 г. служил в копейщиках.» [“The Anfilogovs, in old times also Anpilogovs, Onpilogovs. Vasily, Timofey and Karp Mikulovich, Belyay Vasilyevich, Ivan Pershin, Ivan Nechayev, Sofon Timofeyevich and Yermak Pakhomovich A. held service estates in Korchakov stan of Oryol district in 1594. Vasily Semyonovich O. was granted a novice’s allowance in Kursk in 1628. Ivan Anpilogov, a syn boyarsky of Stary Oskol, served among the lancers in 1695.”]",
      citation: "L. M. Savyolov. «Родословные записи: опыт родословного словаря русского древнего дворянства» [Genealogical notes: towards a genealogical dictionary of the old Russian nobility]. Moscow, 1906. Issue 1. P. 66.",
    },
  },
  uk: {
    "novgorod-menaion-amfilogiy-1097": {
      eyebrow: "Текст служби 1097 року",
      title: "Яким бачили святителя в Новгороді",
      transcription: "У службі Амфілогія називають «божественным громом и трубой духовной», наставником вірних і противником єресей; далі просять про його невпинну молитву за всіх.",
      citation: "«Служебные минеи за сентябрь, октябрь и ноябрь» / вид. В. Ягич. СПб.: Типография Императорской Академии наук, 1886. С. 436; текст за новгородською Службовою Мінеєю 1097 року.",
    },
    "nikonov-ampilogov": {
      eyebrow: "Дві статті на одній сторінці",
      title: "Чому з’явилися форми «Анпілов» і «Анпілогов»",
      transcription: "Для форми Анпілов Никонов окремо пояснює обидві зміни: ф → п під час засвоєння запозиченого імені та м → н, щоб уникнути сусідства двох губних приголосних. Анпілогов він прямо виводить від розмовного Анпілог і церковного Амфілохій.",
      citation: "В. А. Никонов. «Опыт словаря русских фамилий. II» // Этимология. 1971. М.: Наука, 1973. С. 279.",
    },
    "tonkoy-onfilogov": {
      eyebrow: "Наукова публікація рукописної копії",
      title: "Тонкой Онфілогов серед неорних дворів",
      transcription: "«…а непашенных дворов: в. Некраско Данилов, в. Тонкой Онфилогов…»",
      citation: "С. М. Каштанов. «По следам троицких копийных книг XVI в.» // Записки отдела рукописей. Вип. 40. М.: Книга, 1979. С. 43, док. № 3 (у PDF — с. 44).",
    },
    "pavel-anfilogov": {
      eyebrow: "Оригінальний архівний аркуш",
      title: "Павло Терентійович Анфілогов",
      transcription: "Редакційне читання рядка: «Павел Терентьев сын Анфилогов».",
      citation: "Російський державний архів давніх актів. Ф. 181. Оп. 2. Спр. 120. Арк. 58 зв. Цифровий образ 0060.",
    },
    "onfilogovo-tver-1540": {
      eyebrow: "Писцева книга Тверського повіту",
      title: "Село, назване за людиною",
      transcription: "«Къ тому жъ селу деревни: дер. Онфилогово: 4 дв.; пашни въ полѣ 30 четьи, сѣна 30 коп.» — перше з шести сіл маєтку Нікольське Свечино, за Стефанидою, дружиною Івана Юрлова. Про вдівство джерело не повідомляє.",
      citation: "«Писцовыя книги Московскаго государства». Ч. I. Отд. 2 / под ред. Н. В. Калачова. СПб.: Изд. Имп. Русского географического общества, 1877. С. 111. Писцева книга 7048 (1539/40) року письма Івана Петровича Заболоцького та Михайла Іванова Усова-Татищева; рукопис — РДАДА, ф. 1209, оп. 1, кн. 466.",
    },
    "anpilog-onanin-1594": {
      eyebrow: "Орловська писцева книга · 1594/95",
      title: "Анпілог — ще ім’я, а не прізвище",
      transcription: "«За Кондрашкомъ за Вавиловымъ сыномъ Онаньина, что было за дѣдомъ его за Анпилогомъ (sic) за Ивановымъ сыномъ Онаньина въ тойже дер. на Государнинѣ селищѣ, на р. на Орлѣ, подъ Корчаковымъ лѣсомъ…»",
      citation: "«Писцовыя книги Московскаго государства». Ч. I. Отд. 2 / под ред. Н. В. Калачова. СПб., 1877. С. 948; Орловський повіт, Корчаковський стан. Позначка «(sic)» належить видавцеві. Рукопис — РДАДА, ф. 1209, оп. 1, спр. 329; старий шифр МАМЮ — № 399.",
    },
    "nes-anfilogovy": {
      eyebrow: "Енциклопедична стаття 1911 року",
      title: "Дворянський рід, Василь Дмитрович і VI частина",
      transcription: "«Анфилоговы (в старину также Анпилоговы и Онпилоговы), русский дворянский род, ведущий начало от Василия Дмитриевича А., „записанного по городу Орлу московского стола в десятках“. Род А. записан в VI ч. род. кн. Курской губ.»",
      citation: "«Новый энциклопедический словарь» / под ред. К. К. Арсеньева. СПб.: Ф. А. Брокгауз, И. А. Ефрон, 1911. Т. 3. Стб. 108.",
    },
    "savelov-anfilogovy": {
      eyebrow: "Генеалогічний довідник 1906 року",
      title: "Ранні Анфілогови, Анпілогови й Онпілогови",
      transcription: "«Анфилоговы, в старину также Анпилоговы, Онпилоговы. Василий, Тимофей и Карп Микуловичи, Беляй Васильевич, Иван Першин, Иван Нечаев, Софон Тимофеевич и Ермак Пахомович А. в 1594 г. владели поместьями в Корчаковском стану Орловского у. Василий Семенович О. в 1628 г. был верстан новичным окладом по Курску. Иван Анпилогов, старооскольский сын боярский, в 1695 г. служил в копейщиках.»",
      citation: "Л. М. Савёлов. «Родословные записи: опыт родословного словаря русского древнего дворянства». М., 1906. Вып. 1. С. 66.",
    },
  },
  be: {
    "novgorod-menaion-amfilogiy-1097": {
      eyebrow: "Тэкст службы 1097 года",
      title: "Якім бачылі святога ў Ноўгарадзе",
      transcription: "У службе Амфілогія называюць «божественным громом и трубой духовной», настаўнікам вернікаў і праціўнікам ерасей; потым просяць пра яго няспынную малітву за ўсіх.",
      citation: "«Служебные минеи за сентябрь, октябрь и ноябрь» / выд. В. Ягіч. СПб.: Типография Императорской Академии наук, 1886. С. 436; тэкст паводле наўгародскай Службовай Мінеі 1097 года.",
    },
    "nikonov-ampilogov": {
      eyebrow: "Два артыкулы на адной старонцы",
      title: "Чаму з’явіліся формы «Анпілаў» і «Анпілогаў»",
      transcription: "Для формы Анпілаў Нікануў асобна тлумачыць абедзве змены: ф → п пры засваенні запазычанага імені і м → н, каб пазбегнуць суседства двух губных зычных. Анпілогаў ён прама выводзіць ад гутарковага Анпілог і царкоўнага Амфілохій.",
      citation: "В. А. Никонов. «Опыт словаря русских фамилий. II» // Этимология. 1971. М.: Наука, 1973. С. 279.",
    },
    "tonkoy-onfilogov": {
      eyebrow: "Навуковая публікацыя рукапіснай копіі",
      title: "Тонкой Онфілогаў сярод неворных двароў",
      transcription: "«…а непашенных дворов: в. Некраско Данилов, в. Тонкой Онфилогов…»",
      citation: "С. М. Каштанов. «По следам троицких копийных книг XVI в.» // Записки отдела рукописей. Вып. 40. М.: Книга, 1979. С. 43, дак. № 3 (у PDF — с. 44).",
    },
    "pavel-anfilogov": {
      eyebrow: "Арыгінальны архіўны ліст",
      title: "Павел Цярэнцьевіч Анфілогаў",
      transcription: "Рэдакцыйнае чытанне радка: «Павел Терентьев сын Анфилогов».",
      citation: "Расійскі дзяржаўны архіў старажытных актаў. Ф. 181. Воп. 2. Спр. 120. Арк. 58 адв. Лічбавы вобраз 0060.",
    },
    "onfilogovo-tver-1540": {
      eyebrow: "Пісцовая кніга Цвярскога павета",
      title: "Вёска, названая па чалавеку",
      transcription: "«Къ тому жъ селу деревни: дер. Онфилогово: 4 дв.; пашни въ полѣ 30 четьи, сѣна 30 коп.» — першая з шасці вёсак сяла Нікольскае Свечына, за Стэфанідай, жонкай Івана Юрлава. Пра ўдоўства крыніца не паведамляе.",
      citation: "«Писцовыя книги Московскаго государства». Ч. I. Отд. 2 / под ред. Н. В. Калачова. СПб.: Изд. Имп. Русского географического общества, 1877. С. 111. Пісцовая кніга 7048 (1539/40) года пісьма Івана Пятровіча Забалоцкага і Міхаіла Іванава Усава-Тацішчава; рукапіс — РДАСА, ф. 1209, воп. 1, кн. 466.",
    },
    "anpilog-onanin-1594": {
      eyebrow: "Арлоўская пісцовая кніга · 1594/95",
      title: "Анпілог — яшчэ імя, а не прозвішча",
      transcription: "«За Кондрашкомъ за Вавиловымъ сыномъ Онаньина, что было за дѣдомъ его за Анпилогомъ (sic) за Ивановымъ сыномъ Онаньина въ тойже дер. на Государнинѣ селищѣ, на р. на Орлѣ, подъ Корчаковымъ лѣсомъ…»",
      citation: "«Писцовыя книги Московскаго государства». Ч. I. Отд. 2 / под ред. Н. В. Калачова. СПб., 1877. С. 948; Арлоўскі павет, Корчакаўскі стан. Пазнака «(sic)» належыць выдаўцу. Рукапіс — РДАСА, ф. 1209, воп. 1, спр. 329; стары шыфр МАМЮ — № 399.",
    },
    "nes-anfilogovy": {
      eyebrow: "Энцыклапедычны артыкул 1911 года",
      title: "Дваранскі род, Васіль Дзмітрыевіч і VI частка",
      transcription: "«Анфилоговы (в старину также Анпилоговы и Онпилоговы), русский дворянский род, ведущий начало от Василия Дмитриевича А., „записанного по городу Орлу московского стола в десятках“. Род А. записан в VI ч. род. кн. Курской губ.»",
      citation: "«Новый энциклопедический словарь» / под ред. К. К. Арсеньева. СПб.: Ф. А. Брокгауз, И. А. Ефрон, 1911. Т. 3. Стб. 108.",
    },
    "savelov-anfilogovy": {
      eyebrow: "Генеалагічны даведнік 1906 года",
      title: "Раннія Анфілогавы, Анпілогавы і Онпілогавы",
      transcription: "«Анфилоговы, в старину также Анпилоговы, Онпилоговы. Василий, Тимофей и Карп Микуловичи, Беляй Васильевич, Иван Першин, Иван Нечаев, Софон Тимофеевич и Ермак Пахомович А. в 1594 г. владели поместьями в Корчаковском стану Орловского у. Василий Семенович О. в 1628 г. был верстан новичным окладом по Курску. Иван Анпилогов, старооскольский сын боярский, в 1695 г. служил в копейщиках.»",
      citation: "Л. М. Савёлов. «Родословные записи: опыт родословного словаря русского древнего дворянства». М., 1906. Вып. 1. С. 66.",
    },
  },
};

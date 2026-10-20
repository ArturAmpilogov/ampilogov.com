import type { Locale } from "@/i18n/config";
import type { ChapterMetaTranslation } from "@/lib/chapter-meta";

// Translations of the chapter descriptions, period labels and group names in
// chapter-meta.ts. A missing entry falls back to the Russian text.
export const chapterMetaTranslations: Partial<Record<Exclude<Locale, "ru">, ChapterMetaTranslation>> = {
  en: {
    groupLabels: {
      opening: "Introduction",
      name: "How a Name Became a Surname",
      families: "Land, Service and Family",
      geography: "The Surname on the Map",
      appendix: "Continue the Story",
    },
    chapters: {
      "book/01-surname-by-ear": {
        description: "One shared name and many different family stories: how the book is organised and where to look for your own branch.",
      },
      "book/02-greek-amphilochus": {
        description: "A child on an ancient vase, a seer and a hero on coins: the cultural life of the name before the Russian surname appeared.",
        period: {
          from: "8th century",
          fromEra: "BC",
          to: "4th century",
          toEra: "AD",
          label: "The classical tradition",
          note: "The dates refer to surviving texts and inscriptions, not to the hero's mythical biography.",
        },
      },
      "book/03-christian-amphilochius": {
        description: "The memory of the bishop of Iconium keeps the name in the church calendar. In Rus' the bookish form meets living speech.",
        period: {
          from: "4th century",
          to: "15th century",
          label: "The church tradition",
          note: "The bishop of Iconium, the Novgorod Menaion of 1097 and Russian bearers of the church name.",
        },
      },
      "book/04-first-records": {
        description: "A personal name, a name ending in -ov and the name of a village: the first documents show how the surname form arose.",
        period: {
          from: "c. 1495",
          to: "1595",
          label: "A name, a household and a village",
          note: "A personal name, a name ending in -ov and the name of a village: how the documents show the surname form taking shape.",
        },
      },
      "book/05-orel-1594-1596": {
        description: "Nine landholders, seven land shares and service in return for a service estate. The first dense cluster of the surname, in the Oryol district.",
        period: {
          from: "1594",
          to: "1596",
          label: "The Oryol core",
          note: "The first nine landholding servitors and a separate archival sheet about Pavel Anfilogov.",
        },
      },
      "book/06-orel-1625-1645": {
        description: "Children appear in a land extract; repeated musters and the oath let us recognise the same people twenty years later.",
        period: {
          from: "1625",
          to: "1645",
          label: "From the extract to the oath",
          note: "Three families of 1625 and the same names in the oath book compiled twenty years later.",
        },
      },
      "book/07-kursk-oboyan-1636-1651": {
        description: "A horse, weapons, five roubles and two sons. Service lists reveal the conditions of life near a southern fortress.",
        period: {
          from: "1630",
          to: "1651",
          label: "Kursk — Oboyan",
          note: "Enrolment into service, frontier duty and the family of Sergey Grigoryevich Anpilogov.",
        },
      },
      "book/08-akim-bazdyrevo-shchigry-1700": {
        description: "Akim tells of the lost Oryol home and of his grandson's land in the Livny district. A family statement links the two districts.",
        period: {
          from: "1700",
          to: "1782",
          label: "A proven migration",
          note: "Akim's personal sworn statement links the former Oryol service estate with the land of his grandson Tit in the Livny district.",
        },
      },
      "book/09-anfilogov-nobility": {
        description: "How one branch proved its noble descent, and why its history does not define the social estate of everyone who shares the surname.",
        period: {
          from: "1826",
          to: "1887",
          label: "A recognised ancient branch",
          note: "Anfilogovs were entered in Part VI of the Kursk genealogy book; the Heraldry Office files lead to the records of the proven branch.",
        },
      },
      "book/10-anpilogovo-kursk": {
        description: "The name outlives its former owners. Behind two neighbouring villages called Anpilogovo lie different communities.",
        period: {
          from: "1642",
          to: "1934",
          label: "Anpilogovo",
          note: "A 17th-century family service estate, a village of Anpilogov odnodvortsy and a serf village next door.",
        },
      },
      "book/11-anpilovka-stary-oskol": {
        description: "Servitors' households, a mill on the Oskol and a new village: the families appear in the documents before the settlement does.",
        period: {
          from: "1647",
          to: "1811",
          label: "Anpilovka",
          note: "The servitors of Oskol, the mill at Sorokino and the odnodvortsy village of Anpilovs near the village of Bor.",
        },
      },
      "book/12-new-lands": {
        description: "The Ukrainian Line, New Russia, the Caucasus, the Orenburg region, the lower Volga and Siberia: where the families went and why.",
        period: {
          from: "1732",
          to: "1917",
          label: "Migrations to new lands",
          note: "The Ukrainian Line, Timoshevka, Tikhoretskoye, Karmalka and the Orenburg Cossacks, Bakhtemir and Siberia.",
        },
      },
      "book/13-towns-and-parishes": {
        description: "Crimea, the Don, the Donbas, towns and parishes at the turn of the 20th century, and finally the servitor family and its descendants today.",
        period: {
          from: "1868",
          to: "1917",
          label: "The geography of different families",
          note: "Simferopol, Orenburg, the Don and the Donbas, Samara, Melitopol, Kyiv and rural parishes.",
        },
      },
      "book/14-method": {
        description: "From a familiar name to a document: how to continue your own family's story and check the links between generations.",
      },
    },
  },
  uk: {
    groupLabels: {
      opening: "Вступ",
      name: "Як ім'я стало прізвищем",
      families: "Земля, служба і родина",
      geography: "Прізвище на мапі",
      appendix: "Продовжити історію",
    },
    chapters: {
      "book/01-surname-by-ear": {
        description: "Спільне ім'я і різні родинні історії: як побудована книжка і де шукати свою гілку.",
      },
      "book/02-greek-amphilochus": {
        description: "Дитина на давній посудині, віщун і герой на монетах: культурне життя імені до появи руського прізвища.",
        period: {
          from: "VIII століття",
          fromEra: "до нашої ери",
          to: "IV століття",
          toEra: "нашої ери",
          label: "Антична традиція",
          note: "Дати стосуються збережених текстів і написів, а не міфічної біографії героя.",
        },
      },
      "book/03-christian-amphilochius": {
        description: "Пам'ять про єпископа Іконії зберігає ім'я в календарі. На Русі книжна форма зустрічається з живою мовою.",
        period: {
          from: "IV століття",
          to: "XV століття",
          label: "Церковна традиція",
          note: "Єпископ Іконії, Новгородська Мінея 1097 року і руські носії церковного імені.",
        },
      },
      "book/04-first-records": {
        description: "Особове ім'я, найменування на -ов і назва села: перші документи показують, як виникала прізвищева форма.",
        period: {
          from: "бл. 1495",
          to: "1595",
          label: "Ім'я, двір і село",
          note: "Особове ім'я, найменування на -ов і назва села: як документи показують утворення прізвищевої форми.",
        },
      },
      "book/05-orel-1594-1596": {
        description: "Дев'ять власників, сім земельних часток і служба за помістя. Перший щільний осередок прізвища в Орловському повіті.",
        period: {
          from: "1594",
          to: "1596",
          label: "Орловське ядро",
          note: "Перші дев'ять служилих землевласників і окремий архівний аркуш про Павла Анфілогова.",
        },
      },
      "book/06-orel-1625-1645": {
        description: "У земельному виписі з'являються діти; повторні огляди й присяга дають змогу впізнати людей через двадцять років.",
        period: {
          from: "1625",
          to: "1645",
          label: "Від випису до присяги",
          note: "Три родини 1625 року і ті самі імена в присяжній книзі, складеній двадцять років по тому.",
        },
      },
      "book/07-kursk-oboyan-1636-1651": {
        description: "Кінь, зброя, п'ять рублів і два сини. Служилі списки розкривають умови життя біля південної фортеці.",
        period: {
          from: "1630",
          to: "1651",
          label: "Курськ — Обоянь",
          note: "Верстання, прикордонна служба і родина Сергія Григоровича Анпілогова.",
        },
      },
      "book/08-akim-bazdyrevo-shchigry-1700": {
        description: "Аким розповідає про втрачений орловський дім і лівенську землю онука. Два повіти пов'язує родинне свідчення.",
        period: {
          from: "1700",
          to: "1782",
          label: "Доведене переселення",
          note: "Особиста сказка Акима пов'язує колишнє орловське помістя із землею його онука Тита в Лівенському повіті.",
        },
      },
      "book/09-anfilogov-nobility": {
        description: "Як одна гілка підтверджувала дворянське походження і чому її історія не визначає стан усіх однофамільців.",
        period: {
          from: "1826",
          to: "1887",
          label: "Визнана давня гілка",
          note: "Анфілогових внесено до VI частини Курської родовідної книги; справи Герольдії ведуть до матеріалів доведеної гілки.",
        },
      },
      "book/10-anpilogovo-kursk": {
        description: "Назва переживає колишніх власників. За двома сусідніми Анпілоговими виявляються різні громади.",
        period: {
          from: "1642",
          to: "1934",
          label: "Анпілогово",
          note: "Родове помістя XVII століття, село однодворців Анпілогових і кріпацьке село по сусідству.",
        },
      },
      "book/11-anpilovka-stary-oskol": {
        description: "Служилі двори, млин на Осколі й нове село: родини з'являються в документах раніше за поселення.",
        period: {
          from: "1647",
          to: "1811",
          label: "Анпіловка",
          note: "Служилі люди Оскола, млин у Сорокіному і село однодворців Анпілових біля села Бор.",
        },
      },
      "book/12-new-lands": {
        description: "Українська лінія, Новоросія, Кавказ, Оренбуржжя, пониззя Волги й Сибір: куди і чому йшли родини.",
        period: {
          from: "1732",
          to: "1917",
          label: "Переселення на нові землі",
          note: "Українська лінія, Тимошівка, Тихорецьке, Кармалка й оренбурзькі козаки, Бахтемир і Сибір.",
        },
      },
      "book/13-towns-and-parishes": {
        description: "Крим, Дон, Донбас, міста й парафії на межі XIX–XX століть, а зрештою — служилий рід і його нащадки сьогодні.",
        period: {
          from: "1868",
          to: "1917",
          label: "Географія різних родин",
          note: "Сімферополь, Оренбург, Дон і Донбас, Самара, Мелітополь, Київ і сільські парафії.",
        },
      },
      "book/14-method": {
        description: "Від знайомого імені до документа: як продовжити історію своєї родини і перевірити зв'язки між поколіннями.",
      },
    },
  },
  be: {
    groupLabels: {
      opening: "Уступ",
      name: "Як імя стала прозвішчам",
      families: "Зямля, служба і сям'я",
      geography: "Прозвішча на карце",
      appendix: "Працягнуць гісторыю",
    },
    chapters: {
      "book/01-surname-by-ear": {
        description: "Агульнае імя і розныя сямейныя гісторыі: як пабудавана кніга і дзе шукаць сваю галіну.",
      },
      "book/02-greek-amphilochus": {
        description: "Дзіця на старажытнай пасудзіне, прарок і герой на манетах: культурнае жыццё імя да з'яўлення рускага прозвішча.",
        period: {
          from: "VIII стагоддзе",
          fromEra: "да нашай эры",
          to: "IV стагоддзе",
          toEra: "нашай эры",
          label: "Антычная традыцыя",
          note: "Даты адносяцца да захаваных тэкстаў і надпісаў, а не да міфічнай біяграфіі героя.",
        },
      },
      "book/03-christian-amphilochius": {
        description: "Памяць пра епіскапа Іконіі захоўвае імя ў календары. На Русі кніжная форма сустракаецца з жывой мовай.",
        period: {
          from: "IV стагоддзе",
          to: "XV стагоддзе",
          label: "Царкоўная традыцыя",
          note: "Епіскап Іконіі, Наўгародская Мінея 1097 года і рускія носьбіты царкоўнага імя.",
        },
      },
      "book/04-first-records": {
        description: "Асабовае імя, найменне на -оў і назва вёскі: першыя дакументы паказваюць, як узнікала прозвішчавая форма.",
        period: {
          from: "каля 1495",
          to: "1595",
          label: "Імя, двор і вёска",
          note: "Асабовае імя, найменне на -оў і назва вёскі: як дакументы паказваюць утварэнне прозвішчавай формы.",
        },
      },
      "book/05-orel-1594-1596": {
        description: "Дзевяць уладальнікаў, сем зямельных доляў і служба за памесце. Першы шчыльны асяродак прозвішча ў Арлоўскім павеце.",
        period: {
          from: "1594",
          to: "1596",
          label: "Арлоўскае ядро",
          note: "Першыя дзевяць служылых землеўладальнікаў і асобны архіўны ліст пра Паўла Анфілогава.",
        },
      },
      "book/06-orel-1625-1645": {
        description: "У зямельнай выпісе з'яўляюцца дзеці; паўторныя агляды і прысяга дазваляюць пазнаць людзей праз дваццаць гадоў.",
        period: {
          from: "1625",
          to: "1645",
          label: "Ад выпісы да прысягі",
          note: "Тры сям'і 1625 года і тыя ж імёны ў прысяжнай кнізе, складзенай дваццаць гадоў пазней.",
        },
      },
      "book/07-kursk-oboyan-1636-1651": {
        description: "Конь, зброя, пяць рублёў і два сыны. Службовыя спісы раскрываюць умовы жыцця каля паўднёвай крэпасці.",
        period: {
          from: "1630",
          to: "1651",
          label: "Курск — Абаянь",
          note: "Верстанне, памежная служба і сям'я Сяргея Рыгоравіча Анпілогава.",
        },
      },
      "book/08-akim-bazdyrevo-shchigry-1700": {
        description: "Акім расказвае пра страчаны арлоўскі дом і лівенскую зямлю ўнука. Два паветы звязвае сямейнае сведчанне.",
        period: {
          from: "1700",
          to: "1782",
          label: "Даказанае перасяленне",
          note: "Асабістая сказка Акіма звязвае ранейшае арлоўскае памесце з зямлёй яго ўнука Ціта ў Лівенскім павеце.",
        },
      },
      "book/09-anfilogov-nobility": {
        description: "Як адна галіна пацвярджала дваранскае паходжанне і чаму яе гісторыя не вызначае саслоўе ўсіх аднапрозвішчнікаў.",
        period: {
          from: "1826",
          to: "1887",
          label: "Прызнаная старажытная галіна",
          note: "Анфілогавы ўнесены ў VI частку Курскай радаводнай кнігі; справы Геральдыі вядуць да матэрыялаў даказанай галіны.",
        },
      },
      "book/10-anpilogovo-kursk": {
        description: "Назва перажывае ранейшых уладальнікаў. За двума суседнімі Анпілогавымі выяўляюцца розныя абшчыны.",
        period: {
          from: "1642",
          to: "1934",
          label: "Анпілогава",
          note: "Радавое памесце XVII стагоддзя, вёска аднадворцаў Анпілогавых і прыгонная вёска па суседстве.",
        },
      },
      "book/11-anpilovka-stary-oskol": {
        description: "Служылыя двары, млын на Аскале і новая вёска: сем'і з'яўляюцца ў дакументах раней за паселішча.",
        period: {
          from: "1647",
          to: "1811",
          label: "Анпілаўка",
          note: "Служылыя людзі Аскола, млын у Сарокіне і вёска аднадворцаў Анпілавых каля сяла Бор.",
        },
      },
      "book/12-new-lands": {
        description: "Украінская лінія, Наваросія, Каўказ, Арэнбуржжа, нізоўі Волгі і Сібір: куды і чаму сыходзілі сем'і.",
        period: {
          from: "1732",
          to: "1917",
          label: "Перасяленні на новыя землі",
          note: "Украінская лінія, Цімашэўка, Ціхарэцкае, Кармалка і арэнбургскія казакі, Бахтэмір і Сібір.",
        },
      },
      "book/13-towns-and-parishes": {
        description: "Крым, Дон, Данбас, гарады і парафіі на мяжы XIX–XX стагоддзяў, а ў выніку — служылы род і яго нашчадкі сёння.",
        period: {
          from: "1868",
          to: "1917",
          label: "Геаграфія розных сем'яў",
          note: "Сімферопаль, Арэнбург, Дон і Данбас, Самара, Мелітопаль, Кіеў і сельскія парафіі.",
        },
      },
      "book/14-method": {
        description: "Ад знаёмага імя да дакумента: як працягнуць гісторыю сваёй сям'і і праверыць сувязі паміж пакаленнямі.",
      },
    },
  },
};

import { defineCopy } from "@/i18n/copy";

export type Person = {
  name: string;
  note?: string;
};

export type KinshipPath = {
  label: string;
  certainty?: "documented" | "probable";
  generations: Person[][];
};

export type KinshipDiagramDefinition = { eyebrow: string; title: string; paths: KinshipPath[]; note?: string };

export type OrelBranch = {
  certainty: "documented" | "probable";
  label: string;
  explanation: string;
  parent: Person;
  children: Person[];
};

type KinshipCopy = {
  generation: (index: number) => string;
  amphilochos: {
    eyebrow: string;
    title: string;
    groupLabel: string;
    parentsLabel: string;
    parentsHeading: string;
    childrenLabel: string;
    childrenHeading: string;
    amphiaraus: Person;
    eriphyle: Person;
    alcmaeon: Person;
    amphilochus: Person;
  };
  orel1594: {
    eyebrow: string;
    title: string;
    groupLabel: string;
    note: string;
    branches: OrelBranch[];
  };
  diagrams: Record<string, KinshipDiagramDefinition>;
};

export const kinshipCopy = defineCopy<KinshipCopy>(
  {
    generation: (index) => `${index}-е поколение`,
    amphilochos: {
      eyebrow: "Фиванский цикл",
      title: "Семья прорицателя",
      groupLabel: "Амфиарай и Эрифила — родители Алкмеона и Амфилохоса",
      parentsLabel: "Родители",
      parentsHeading: "Родители",
      childrenLabel: "Дети",
      childrenHeading: "Сыновья",
      amphiaraus: { name: "Амфиарай", note: "прорицатель" },
      eriphyle: { name: "Эрифила", note: "мать героев" },
      alcmaeon: { name: "Алкмеон", note: "предводитель эпигонов" },
      amphilochus: { name: "Амфилохос", note: "прорицатель и герой-врач" },
    },
    orel1594: {
      eyebrow: "Писцовая книга 1594/95 года",
      title: "Родство в Баздыреве",
      groupLabel: "Документированная семья Микулы и предполагаемая семья Василия",
      note: "Сплошная линия повторяет прямую формулу писцовой книги; пунктир показывает вероятную связь, которую документ не называет родством.",
      branches: [
        {
          certainty: "documented",
          label: "Родство названо прямо",
          explanation: "Василий, Тимофей и Карп записаны Микулиными детьми.",
          parent: { name: "Микула", note: "отец назван в отчествах сыновей" },
          children: [
            { name: "Василий", note: "Микулин сын Анфилогов" },
            { name: "Тимофей", note: "Микулин сын Анфилогов" },
            { name: "Карп", note: "Микулин сын Анфилогов" },
          ],
        },
        {
          certainty: "probable",
          label: "Вероятное родство",
          explanation: "Одинаковое отчество и одна деревня позволяют предполагать общего отца.",
          parent: { name: "Василий", note: "предполагаемый общий отец" },
          children: [
            { name: "Беляй", note: "Васильев сын Онфилогов" },
            { name: "Осип", note: "Васильев сын Анфилогов" },
          ],
        },
      ],
    },
    diagrams: {
      amphilochos: {
        eyebrow: "Фиванский цикл",
        title: "Семья прорицателя",
        paths: [
          {
            label: "Родство в античной традиции",
            generations: [
              [
                { name: "Амфиарай", note: "прорицатель" },
                { name: "Эрифила", note: "мать героев" },
              ],
              [
                { name: "Алкмеон", note: "предводитель эпигонов" },
                { name: "Амфилохос", note: "прорицатель и герой-врач" },
              ],
            ],
          },
        ],
      },
      "orel-1625": {
        eyebrow: "Выписи 1625 года",
        title: "Три прямо названные ветви",
        paths: [
          {
            label: "Карповы дети",
            generations: [
              [{ name: "Карп Анфилогов" }],
              [{ name: "Мартын" }, { name: "Кузьма" }],
            ],
          },
          {
            label: "Ивановы дети · деревня Белая",
            generations: [
              [{ name: "Иван Анфилогов" }],
              [{ name: "Илья" }, { name: "Василий" }, { name: "Антон" }],
            ],
          },
          {
            label: "Васильевы дети · Баздырево",
            generations: [
              [{ name: "Василий Анфилогов" }],
              [{ name: "Алексей" }, { name: "Григорий" }],
            ],
          },
        ],
        note: "Все три связи отец — дети прямо названы в выписи 1625 года; схема не добавляет предполагаемых поколений.",
      },
      sergey: {
        eyebrow: "Три поколения в одной записи",
        title: "Семья Сергея Григорьевича",
        paths: [
          {
            label: "Обоянская десятня 1651 года",
            generations: [
              [{ name: "Григорий", note: "назван только в отчестве сына" }],
              [{ name: "Сергей Григорьевич", note: "городовой сын боярский" }],
              [
                { name: "Сидор", note: "20 лет" },
                { name: "Еремей", note: "10 лет" },
              ],
            ],
          },
        ],
      },
      anpilovka: {
        eyebrow: "Старооскольские служилые книги",
        title: "Анпиловы до появления селения",
        paths: [
          {
            label: "Линия Герасима",
            generations: [
              [{ name: "Герасим Анпилов", note: "записан в 1668 году" }],
              [{ name: "Степан Герасимов", note: "копейщик" }],
            ],
          },
          {
            label: "Линия Иева Михайлова",
            generations: [
              [{ name: "Михаил", note: "назван в отчествах сыновей" }],
              [{ name: "Иев Михайлов", note: "копейщик" }],
              [
                { name: "Ларион Иевлев", note: "копейная служба" },
                { name: "Анисим Иевлев", note: "копейная служба" },
              ],
            ],
          },
          {
            label: "Линия Григория Михайлова",
            generations: [
              [{ name: "Михаил", note: "назван в отчестве сына" }],
              [{ name: "Григорий Михайлов", note: "служилый двор" }],
            ],
          },
        ],
      },
      bazdyrevo: {
        eyebrow: "Сказка 1700 года",
        title: "Три поколения между двумя уездами",
        paths: [
          {
            label: "Родство названо в документе",
            generations: [
              [{ name: "Аким Иванович", note: "бывший помещик Баздырева" }],
              [{ name: "имя не названо", note: "сын или дочь Акима" }],
              [{ name: "Тит Анпилогов", note: "внук · поместье в Щиграх" }],
            ],
          },
        ],
      },
    },
  },
  {
    en: {
      generation: (index) => `Generation ${index}`,
      amphilochos: {
        eyebrow: "The Theban Cycle",
        title: "The seer’s family",
        groupLabel: "Amphiaraus and Eriphyle, parents of Alcmaeon and Amphilochus",
        parentsLabel: "Parents",
        parentsHeading: "Parents",
        childrenLabel: "Children",
        childrenHeading: "Sons",
        amphiaraus: { name: "Amphiaraus", note: "seer" },
        eriphyle: { name: "Eriphyle", note: "mother of heroes" },
        alcmaeon: { name: "Alcmaeon", note: "leader of the Epigoni" },
        amphilochus: { name: "Amphilochus", note: "seer and healer-hero" },
      },
      orel1594: {
        eyebrow: "Cadastral book of 1594/95",
        title: "Kinship in Bazdyrevo",
        groupLabel: "Mikula’s documented family and Vasily’s presumed family",
        note: "The solid line follows the cadastral book’s explicit formula; the dashed line shows a probable link that the document does not call kinship.",
        branches: [
          {
            certainty: "documented",
            label: "Kinship stated directly",
            explanation: "Vasily, Timofey and Karp are recorded as Mikula’s children.",
            parent: { name: "Mikula", note: "father named in his sons’ patronymics" },
            children: [
              { name: "Vasily", note: "“Mikulin syn Anfilogov” (Mikula’s son)" },
              { name: "Timofey", note: "“Mikulin syn Anfilogov” (Mikula’s son)" },
              { name: "Karp", note: "“Mikulin syn Anfilogov” (Mikula’s son)" },
            ],
          },
          {
            certainty: "probable",
            label: "Probable kinship",
            explanation: "The same patronymic and the same village suggest a common father.",
            parent: { name: "Vasily", note: "presumed common father" },
            children: [
              { name: "Belyay", note: "“Vasilyev syn Onfilogov” (Vasily’s son)" },
              { name: "Osip", note: "“Vasilyev syn Anfilogov” (Vasily’s son)" },
            ],
          },
        ],
      },
      diagrams: {
        amphilochos: {
          eyebrow: "The Theban Cycle",
          title: "The seer’s family",
          paths: [
            {
              label: "Kinship in the classical tradition",
              generations: [
                [
                  { name: "Amphiaraus", note: "seer" },
                  { name: "Eriphyle", note: "mother of heroes" },
                ],
                [
                  { name: "Alcmaeon", note: "leader of the Epigoni" },
                  { name: "Amphilochus", note: "seer and healer-hero" },
                ],
              ],
            },
          ],
        },
        "orel-1625": {
          eyebrow: "Extracts of 1625",
          title: "Three directly named branches",
          paths: [
            {
              label: "Karp’s children",
              generations: [
                [{ name: "Karp Anfilogov" }],
                [{ name: "Martyn" }, { name: "Kuzma" }],
              ],
            },
            {
              label: "Ivan’s children · the village of Belaya",
              generations: [
                [{ name: "Ivan Anfilogov" }],
                [{ name: "Ilya" }, { name: "Vasily" }, { name: "Anton" }],
              ],
            },
            {
              label: "Vasily’s children · Bazdyrevo",
              generations: [
                [{ name: "Vasily Anfilogov" }],
                [{ name: "Aleksey" }, { name: "Grigory" }],
              ],
            },
          ],
          note: "All three father–children links are stated directly in the 1625 extract; the diagram adds no presumed generations.",
        },
        sergey: {
          eyebrow: "Three generations in one entry",
          title: "The family of Sergey Grigoryevich",
          paths: [
            {
              label: "Oboyan muster roll (desyatnya) of 1651",
              generations: [
                [{ name: "Grigory", note: "named only in his son’s patronymic" }],
                [{ name: "Sergey Grigoryevich", note: "town syn boyarsky (petty serviceman)" }],
                [
                  { name: "Sidor", note: "aged 20" },
                  { name: "Yeremey", note: "aged 10" },
                ],
              ],
            },
          ],
        },
        anpilovka: {
          eyebrow: "Stary Oskol service books",
          title: "The Anpilovs before the village existed",
          paths: [
            {
              label: "Gerasim’s line",
              generations: [
                [{ name: "Gerasim Anpilov", note: "recorded in 1668" }],
                [{ name: "Stepan Gerasimov", note: "lancer" }],
              ],
            },
            {
              label: "The line of Iev Mikhaylov",
              generations: [
                [{ name: "Mikhail", note: "named in his sons’ patronymics" }],
                [{ name: "Iev Mikhaylov", note: "lancer" }],
                [
                  { name: "Larion Ievlev", note: "lancer service" },
                  { name: "Anisim Ievlev", note: "lancer service" },
                ],
              ],
            },
            {
              label: "The line of Grigory Mikhaylov",
              generations: [
                [{ name: "Mikhail", note: "named in his son’s patronymic" }],
                [{ name: "Grigory Mikhaylov", note: "service household" }],
              ],
            },
          ],
        },
        bazdyrevo: {
          eyebrow: "Statement (skazka) of 1700",
          title: "Three generations across two districts",
          paths: [
            {
              label: "Kinship stated in the document",
              generations: [
                [{ name: "Akim Ivanovich", note: "former landholder of Bazdyrevo" }],
                [{ name: "name not given", note: "Akim’s son or daughter" }],
                [{ name: "Tit Anpilogov", note: "grandson · estate in Shchigry" }],
              ],
            },
          ],
        },
      },
    },
    uk: {
      generation: (index) => `${index}-ше покоління`,
      amphilochos: {
        eyebrow: "Фіванський цикл",
        title: "Родина віщуна",
        groupLabel: "Амфіарай і Ерифіла — батьки Алкмеона та Амфілохоса",
        parentsLabel: "Батьки",
        parentsHeading: "Батьки",
        childrenLabel: "Діти",
        childrenHeading: "Сини",
        amphiaraus: { name: "Амфіарай", note: "віщун" },
        eriphyle: { name: "Ерифіла", note: "мати героїв" },
        alcmaeon: { name: "Алкмеон", note: "провідник епігонів" },
        amphilochus: { name: "Амфілохос", note: "віщун і герой-лікар" },
      },
      orel1594: {
        eyebrow: "Писцева книга 1594/95 року",
        title: "Спорідненість у Баздиреві",
        groupLabel: "Задокументована родина Микули і ймовірна родина Василя",
        note: "Суцільна лінія повторює пряму формулу писцевої книги; пунктир показує ймовірний зв’язок, який документ не називає спорідненістю.",
        branches: [
          {
            certainty: "documented",
            label: "Спорідненість названо прямо",
            explanation: "Василя, Тимофія і Карпа записано Микулиними дітьми.",
            parent: { name: "Микула", note: "батька названо в по батькові синів" },
            children: [
              { name: "Василь", note: "«Микулин сын Анфилогов»" },
              { name: "Тимофій", note: "«Микулин сын Анфилогов»" },
              { name: "Карп", note: "«Микулин сын Анфилогов»" },
            ],
          },
          {
            certainty: "probable",
            label: "Імовірна спорідненість",
            explanation: "Однакове по батькові й одне село дають підстави припускати спільного батька.",
            parent: { name: "Василь", note: "імовірний спільний батько" },
            children: [
              { name: "Беляй", note: "«Васильев сын Онфилогов»" },
              { name: "Осип", note: "«Васильев сын Анфилогов»" },
            ],
          },
        ],
      },
      diagrams: {
        amphilochos: {
          eyebrow: "Фіванський цикл",
          title: "Родина віщуна",
          paths: [
            {
              label: "Спорідненість в античній традиції",
              generations: [
                [
                  { name: "Амфіарай", note: "віщун" },
                  { name: "Ерифіла", note: "мати героїв" },
                ],
                [
                  { name: "Алкмеон", note: "провідник епігонів" },
                  { name: "Амфілохос", note: "віщун і герой-лікар" },
                ],
              ],
            },
          ],
        },
        "orel-1625": {
          eyebrow: "Виписи 1625 року",
          title: "Три прямо названі гілки",
          paths: [
            {
              label: "Карпові діти",
              generations: [
                [{ name: "Карп Анфілогов" }],
                [{ name: "Мартин" }, { name: "Кузьма" }],
              ],
            },
            {
              label: "Іванові діти · село Біла",
              generations: [
                [{ name: "Іван Анфілогов" }],
                [{ name: "Ілля" }, { name: "Василь" }, { name: "Антон" }],
              ],
            },
            {
              label: "Василеві діти · Баздирево",
              generations: [
                [{ name: "Василь Анфілогов" }],
                [{ name: "Олексій" }, { name: "Григорій" }],
              ],
            },
          ],
          note: "Усі три зв’язки батько — діти прямо названо у виписі 1625 року; схема не додає припущених поколінь.",
        },
        sergey: {
          eyebrow: "Три покоління в одному записі",
          title: "Родина Сергія Григоровича",
          paths: [
            {
              label: "Обоянська десятня 1651 року",
              generations: [
                [{ name: "Григорій", note: "названий лише в по батькові сина" }],
                [{ name: "Сергій Григорович", note: "городовий син боярський" }],
                [
                  { name: "Сидір", note: "20 років" },
                  { name: "Єремій", note: "10 років" },
                ],
              ],
            },
          ],
        },
        anpilovka: {
          eyebrow: "Старооскольські служилі книги",
          title: "Анпілови до появи поселення",
          paths: [
            {
              label: "Лінія Герасима",
              generations: [
                [{ name: "Герасим Анпілов", note: "записаний 1668 року" }],
                [{ name: "Степан Герасимов", note: "списник" }],
              ],
            },
            {
              label: "Лінія Ієва Михайлова",
              generations: [
                [{ name: "Михайло", note: "названий у по батькові синів" }],
                [{ name: "Ієв Михайлов", note: "списник" }],
                [
                  { name: "Ларіон Ієвлев", note: "списна служба" },
                  { name: "Анісим Ієвлев", note: "списна служба" },
                ],
              ],
            },
            {
              label: "Лінія Григорія Михайлова",
              generations: [
                [{ name: "Михайло", note: "названий у по батькові сина" }],
                [{ name: "Григорій Михайлов", note: "служилий двір" }],
              ],
            },
          ],
        },
        bazdyrevo: {
          eyebrow: "Сказка 1700 року",
          title: "Три покоління між двома повітами",
          paths: [
            {
              label: "Спорідненість названо в документі",
              generations: [
                [{ name: "Аким Іванович", note: "колишній поміщик Баздирева" }],
                [{ name: "ім’я не назване", note: "син або дочка Акима" }],
                [{ name: "Тит Анпілогов", note: "онук · маєток у Щиграх" }],
              ],
            },
          ],
        },
      },
    },
    be: {
      generation: (index) => `${index}-е пакаленне`,
      amphilochos: {
        eyebrow: "Фіванскі цыкл",
        title: "Сям’я прарока",
        groupLabel: "Амфіярай і Эрыфіла — бацькі Алкмеона і Амфілохаса",
        parentsLabel: "Бацькі",
        parentsHeading: "Бацькі",
        childrenLabel: "Дзеці",
        childrenHeading: "Сыны",
        amphiaraus: { name: "Амфіярай", note: "прарок" },
        eriphyle: { name: "Эрыфіла", note: "маці герояў" },
        alcmaeon: { name: "Алкмеон", note: "правадыр эпігонаў" },
        amphilochus: { name: "Амфілохас", note: "прарок і герой-лекар" },
      },
      orel1594: {
        eyebrow: "Пісцовая кніга 1594/95 года",
        title: "Сваяцтва ў Баздыраве",
        groupLabel: "Дакументаваная сям’я Мікулы і меркаваная сям’я Васіля",
        note: "Суцэльная лінія паўтарае прамую формулу пісцовай кнігі; пункцір паказвае верагодную сувязь, якую дакумент не называе сваяцтвам.",
        branches: [
          {
            certainty: "documented",
            label: "Сваяцтва названа прама",
            explanation: "Васіль, Цімафей і Карп запісаныя Мікулінымі дзецьмі.",
            parent: { name: "Мікула", note: "бацька названы ў імёнах па бацьку сыноў" },
            children: [
              { name: "Васіль", note: "«Микулин сын Анфилогов»" },
              { name: "Цімафей", note: "«Микулин сын Анфилогов»" },
              { name: "Карп", note: "«Микулин сын Анфилогов»" },
            ],
          },
          {
            certainty: "probable",
            label: "Верагоднае сваяцтва",
            explanation: "Аднолькавае імя па бацьку і адна вёска дазваляюць меркаваць агульнага бацьку.",
            parent: { name: "Васіль", note: "меркаваны агульны бацька" },
            children: [
              { name: "Беляй", note: "«Васильев сын Онфилогов»" },
              { name: "Восіп", note: "«Васильев сын Анфилогов»" },
            ],
          },
        ],
      },
      diagrams: {
        amphilochos: {
          eyebrow: "Фіванскі цыкл",
          title: "Сям’я прарока",
          paths: [
            {
              label: "Сваяцтва ў антычнай традыцыі",
              generations: [
                [
                  { name: "Амфіярай", note: "прарок" },
                  { name: "Эрыфіла", note: "маці герояў" },
                ],
                [
                  { name: "Алкмеон", note: "правадыр эпігонаў" },
                  { name: "Амфілохас", note: "прарок і герой-лекар" },
                ],
              ],
            },
          ],
        },
        "orel-1625": {
          eyebrow: "Выпісы 1625 года",
          title: "Тры прама названыя галіны",
          paths: [
            {
              label: "Карпавы дзеці",
              generations: [
                [{ name: "Карп Анфілогаў" }],
                [{ name: "Марцін" }, { name: "Кузьма" }],
              ],
            },
            {
              label: "Іванавы дзеці · вёска Белая",
              generations: [
                [{ name: "Іван Анфілогаў" }],
                [{ name: "Ілья" }, { name: "Васіль" }, { name: "Антон" }],
              ],
            },
            {
              label: "Васілевы дзеці · Баздырава",
              generations: [
                [{ name: "Васіль Анфілогаў" }],
                [{ name: "Аляксей" }, { name: "Рыгор" }],
              ],
            },
          ],
          note: "Усе тры сувязі бацька — дзеці прама названыя ў выпісе 1625 года; схема не дадае меркаваных пакаленняў.",
        },
        sergey: {
          eyebrow: "Тры пакаленні ў адным запісе",
          title: "Сям’я Сяргея Рыгоравіча",
          paths: [
            {
              label: "Абаянская дзесятня 1651 года",
              generations: [
                [{ name: "Рыгор", note: "названы толькі ў імені па бацьку сына" }],
                [{ name: "Сяргей Рыгоравіч", note: "гарадавы сын баярскі" }],
                [
                  { name: "Сідар", note: "20 гадоў" },
                  { name: "Ярэмей", note: "10 гадоў" },
                ],
              ],
            },
          ],
        },
        anpilovka: {
          eyebrow: "Стараоскальскія служылыя кнігі",
          title: "Анпілавы да з’яўлення паселішча",
          paths: [
            {
              label: "Лінія Герасіма",
              generations: [
                [{ name: "Герасім Анпілаў", note: "запісаны ў 1668 годзе" }],
                [{ name: "Сцяпан Герасімаў", note: "капейшчык" }],
              ],
            },
            {
              label: "Лінія Іева Міхайлава",
              generations: [
                [{ name: "Міхаіл", note: "названы ў імёнах па бацьку сыноў" }],
                [{ name: "Іеў Міхайлаў", note: "капейшчык" }],
                [
                  { name: "Ларыён Іеўлеў", note: "капейная служба" },
                  { name: "Анісім Іеўлеў", note: "капейная служба" },
                ],
              ],
            },
            {
              label: "Лінія Рыгора Міхайлава",
              generations: [
                [{ name: "Міхаіл", note: "названы ў імені па бацьку сына" }],
                [{ name: "Рыгор Міхайлаў", note: "служылы двор" }],
              ],
            },
          ],
        },
        bazdyrevo: {
          eyebrow: "Сказка 1700 года",
          title: "Тры пакаленні паміж двума паветамі",
          paths: [
            {
              label: "Сваяцтва названа ў дакуменце",
              generations: [
                [{ name: "Акім Іванавіч", note: "былы памешчык Баздырава" }],
                [{ name: "імя не названа", note: "сын або дачка Акіма" }],
                [{ name: "Ціт Анпілогаў", note: "унук · маёнтак у Шчыграх" }],
              ],
            },
          ],
        },
      },
    },
  },
);

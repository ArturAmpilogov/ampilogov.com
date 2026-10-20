import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { defineCopy } from "@/i18n/copy";
import { localeAlternates } from "@/i18n/metadata";
import { setRequestLocale } from "@/i18n/server";

type ContactPageProps = { params: Promise<{ locale: string }> };

const copy = defineCopy({
  metaTitle: "Связаться",
  metaDescription: "Как написать автору исследования Ампилоговых и где посмотреть открытый код сайта.",
  eyebrow: "Обратная связь",
  title: "Связаться",
  lead: "Нашли документ о носителях фамилии, знаете, откуда они переселялись, или заметили ошибку? Напишите — каждое письмо добавляет звено в историю фамилии.",
  emailTerm: "Почта",
  emailText: "Главная цель — восстановить родословную: откуда пошла фамилия и как она расходилась по стране. Присылайте сведения о предках-носителях фамилии — где и когда они жили, откуда переселялись, — сканы метрик и других документов, фотографии и вопросы по записям сайта. Будем рады исправлениям и уточнениям — если заметили ошибку в имени, дате, чтении документа или родственной связи, — а также идеям, как улучшить сайт. Пока публикуются сведения о людях до 1950 года.",
  projectTerm: "Открытый проект",
  projectText: "Код сайта и тексты книги открыты: там видно, как устроены страницы и записи, и можно предложить исправление.",
  authorTerm: "Автор",
  authorName: "Артур Ампилогов",
  authorText: "Персональный сайт автора исследования.",
  aboutTitle: "Как сделан проект",
  about: [
    "Исследование проводилось с четырьмя моделями искусственного интеллекта. ИИ читали и расшифровывали сканы метрических книг, ревизских сказок и старинных рукописей, искали записи в FamilySearch, Яндекс Архиве и архивных каталогах, сверяли варианты фамилии, готовили запросы в архивы, черновики глав, карты и родословные схемы.",
    "Каждый вывод опирается на документ: ссылка на источник или скан стоит рядом с текстом, а неуверенные чтения отмечены отдельно. Ошибки всё же возможны — если заметите, напишите.",
  ],
}, {
  en: {
    metaTitle: "Contact",
    metaDescription: "How to write to the author of the Ampilogov research and where to see the site's open source code.",
    eyebrow: "Feedback",
    title: "Contact",
    lead: "Found a document about bearers of the surname, know where they moved from, or spotted a mistake? Write in — every letter adds a link to the history of the surname.",
    emailTerm: "Email",
    emailText: "The main goal is to reconstruct the genealogy: where the surname came from and how it spread across the country. Send what you know about ancestors who bore the surname — where and when they lived, where they moved from — scans of parish registers and other documents, photographs and questions about the records on the site. Corrections are very welcome — a mistake in a name, a date, the reading of a document or a family link — as are ideas for improving the site. For now, information is published about people up to 1950. Letters in English, Ukrainian, Belarusian or Russian are all fine.",
    projectTerm: "Open project",
    projectText: "The site's code and the texts of the book are open: you can see how the pages and records are built and suggest a correction.",
    authorTerm: "Author",
    authorName: "Artur Ampilogov",
    authorText: "Personal website of the author of the research.",
    aboutTitle: "How the project was made",
    about: [
      "The research was carried out with four artificial intelligence models. The AI read and transcribed scans of parish registers, revision tales (census lists) and old manuscripts, searched for records in FamilySearch, Yandex Archive and archival catalogues, compared variants of the surname, and prepared requests to archives, chapter drafts, maps and family charts.",
      "Every conclusion rests on a document: a link to the source or scan sits next to the text, and uncertain readings are marked separately. Mistakes are still possible — if you notice one, please write. The translations from Russian were also made with AI; the Russian text remains the reference version.",
    ],
  },
  uk: {
    metaTitle: "Зв’язатися",
    metaDescription: "Як написати авторові дослідження Ампілогових і де переглянути відкритий код сайту.",
    eyebrow: "Зворотний зв’язок",
    title: "Зв’язатися",
    lead: "Знайшли документ про носіїв прізвища, знаєте, звідки вони переселялися, або помітили помилку? Напишіть — кожен лист додає ланку в історію прізвища.",
    emailTerm: "Пошта",
    emailText: "Головна мета — відновити родовід: звідки походить прізвище і як воно розходилося країною. Надсилайте відомості про предків — носіїв прізвища: де й коли вони жили, звідки переселялися, — скани метричних книг та інших документів, фотографії й запитання щодо записів сайту. Будемо раді виправленням і уточненням — якщо помітили помилку в імені, даті, прочитанні документа чи родинному зв’язку, — а також ідеям, як покращити сайт. Наразі публікуються відомості про людей до 1950 року. Писати можна українською, білоруською, англійською чи російською.",
    projectTerm: "Відкритий проєкт",
    projectText: "Код сайту і тексти книги відкриті: там видно, як влаштовані сторінки і записи, і можна запропонувати виправлення.",
    authorTerm: "Автор",
    authorName: "Артур Ампілогов",
    authorText: "Персональний сайт автора дослідження.",
    aboutTitle: "Як зроблено проєкт",
    about: [
      "Дослідження проводилося з чотирма моделями штучного інтелекту. ШІ читали й розшифровували скани метричних книг, ревізьких казок і старовинних рукописів, шукали записи у FamilySearch, Яндекс Архіві та архівних каталогах, звіряли варіанти прізвища, готували запити до архівів, чернетки розділів, мапи й родовідні схеми.",
      "Кожен висновок спирається на документ: посилання на джерело або скан стоїть поруч із текстом, а непевні прочитання позначено окремо. Помилки все ж можливі — якщо помітите, напишіть. Переклади з російської також зроблено за допомогою ШІ; еталонною лишається російська версія.",
    ],
  },
  be: {
    metaTitle: "Звязацца",
    metaDescription: "Як напісаць аўтару даследавання Ампілогавых і дзе паглядзець адкрыты код сайта.",
    eyebrow: "Зваротная сувязь",
    title: "Звязацца",
    lead: "Знайшлі дакумент пра носьбітаў прозвішча, ведаеце, адкуль яны перасяляліся, або заўважылі памылку? Напішыце — кожны ліст дадае звяно ў гісторыю прозвішча.",
    emailTerm: "Пошта",
    emailText: "Галоўная мэта — аднавіць радавод: адкуль пайшло прозвішча і як яно разыходзілася па краіне. Дасылайце звесткі пра продкаў — носьбітаў прозвішча: дзе і калі яны жылі, адкуль перасяляліся, — сканы метрычных кніг і іншых дакументаў, фотаздымкі і пытанні пра запісы сайта. Будзем радыя выпраўленням і ўдакладненням — калі заўважылі памылку ў імені, даце, чытанні дакумента ці сваяцкай сувязі, — а таксама ідэям, як палепшыць сайт. Пакуль публікуюцца звесткі пра людзей да 1950 года. Пісаць можна па-беларуску, па-ўкраінску, па-англійску ці па-руску.",
    projectTerm: "Адкрыты праект",
    projectText: "Код сайта і тэксты кнігі адкрытыя: там відаць, як уладкаваныя старонкі і запісы, і можна прапанаваць выпраўленне.",
    authorTerm: "Аўтар",
    authorName: "Артур Ампілогаў",
    authorText: "Персанальны сайт аўтара даследавання.",
    aboutTitle: "Як зроблены праект",
    about: [
      "Даследаванне праводзілася з чатырма мадэлямі штучнага інтэлекту. ШІ чыталі і расшыфроўвалі сканы метрычных кніг, рэвізскіх казак і старадаўніх рукапісаў, шукалі запісы ў FamilySearch, Яндэкс Архіве і архіўных каталогах, звяралі варыянты прозвішча, рыхтавалі запыты ў архівы, чарнавікі раздзелаў, мапы і радаводныя схемы.",
      "Кожная выснова абапіраецца на дакумент: спасылка на крыніцу або скан стаіць побач з тэкстам, а няпэўныя чытанні адзначаны асобна. Памылкі ўсё ж магчымыя — калі заўважыце, напішыце. Пераклады з рускай таксама зроблены з дапамогай ШІ; эталоннай застаецца руская версія.",
    ],
  },
});

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const locale = setRequestLocale((await params).locale);
  return {
    title: copy[locale].metaTitle,
    description: copy[locale].metaDescription,
    alternates: localeAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const text = copy[setRequestLocale((await params).locale)];

  return (
    <main className="contact-page">
      <SiteHeader />
      <section className="contact-shell section-shell">
        <span className="eyebrow">{text.eyebrow}</span>
        <h1>{text.title}</h1>
        <p className="contact-lead">{text.lead}</p>

        <dl className="contact-list">
          <div>
            <dt>{text.emailTerm}</dt>
            <dd>
              <a href="mailto:genealogy@ampilogov.com">genealogy@ampilogov.com</a>
              <p>{text.emailText}</p>
            </dd>
          </div>
          <div>
            <dt>{text.projectTerm}</dt>
            <dd>
              <a href="https://github.com/ArturAmpilogov/ampilogov.com" target="_blank" rel="noreferrer">
                github.com/ArturAmpilogov/ampilogov.com
              </a>
              <p>{text.projectText}</p>
            </dd>
          </div>
          <div>
            <dt>{text.authorTerm}</dt>
            <dd>
              <a href="https://artur-ampilogov.com/" target="_blank" rel="noreferrer">{text.authorName}</a>
              <p>{text.authorText}</p>
            </dd>
          </div>
        </dl>

        <section className="contact-about" aria-labelledby="contact-about-title">
          <h2 id="contact-about-title">{text.aboutTitle}</h2>
          {text.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      </section>
    </main>
  );
}

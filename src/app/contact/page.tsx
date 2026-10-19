import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Связаться",
  description: "Как написать автору исследования Ампилоговых и где посмотреть открытый код сайта.",
};

export default function ContactPage() {
  return (
    <main className="contact-page">
      <SiteHeader />
      <section className="contact-shell section-shell">
        <span className="eyebrow">Обратная связь</span>
        <h1>Связаться</h1>
        <p className="contact-lead">
          Нашли документ о носителях фамилии, знаете, откуда они переселялись, или заметили ошибку?
          Напишите — каждое письмо добавляет звено в историю фамилии.
        </p>

        <dl className="contact-list">
          <div>
            <dt>Почта</dt>
            <dd>
              <a href="mailto:genealogy@ampilogov.com">genealogy@ampilogov.com</a>
              <p>
                Главная цель — восстановить родословную: откуда пошла фамилия и как она расходилась
                по стране. Присылайте сведения о предках-носителях фамилии — где и когда они жили,
                откуда переселялись, — сканы метрик и других документов, фотографии и вопросы
                по записям сайта. Будем рады исправлениям и уточнениям — если заметили
                ошибку в имени, дате, чтении документа или родственной связи, — а также идеям, как
                улучшить сайт. Пока публикуются сведения о людях до 1950 года.
              </p>
            </dd>
          </div>
          <div>
            <dt>Открытый проект</dt>
            <dd>
              <a href="https://github.com/ArturAmpilogov/ampilogov.com" target="_blank" rel="noreferrer">
                github.com/ArturAmpilogov/ampilogov.com
              </a>
              <p>
                Код сайта и тексты книги открыты: там видно, как устроены страницы и записи, и можно
                предложить исправление.
              </p>
            </dd>
          </div>
          <div>
            <dt>Автор</dt>
            <dd>
              <a href="https://artur-ampilogov.com/" target="_blank" rel="noreferrer">Артур Ампилогов</a>
              <p>Персональный сайт автора исследования.</p>
            </dd>
          </div>
        </dl>

        <section className="contact-about" aria-labelledby="contact-about-title">
          <h2 id="contact-about-title">Как сделан проект</h2>
          <p>
            Исследование проводилось с четырьмя моделями искусственного интеллекта.
            ИИ читали и расшифровывали сканы метрических книг, ревизских сказок и старинных рукописей,
            искали записи в FamilySearch, Яндекс Архиве и архивных каталогах, сверяли варианты фамилии,
            готовили запросы в архивы, черновики глав, карты и родословные схемы.
          </p>
          <p>
            Каждый вывод опирается на документ: ссылка на источник или скан стоит рядом с текстом, а
            неуверенные чтения отмечены отдельно. Ошибки всё же возможны — если заметите, напишите.
          </p>
        </section>
      </section>
    </main>
  );
}

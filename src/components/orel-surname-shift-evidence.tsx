const comparisons = [
  {
    person: "Иван Васильевич",
    july: {
      date: "2 июля",
      form: "Онфилогов",
      line: "Ивашка Васильев сын Онфилогов",
      href: "/records/RGADA-210-12-13-L105",
      leaf: "л. 105",
    },
    october: {
      date: "4 октября",
      form: "Анфилогов",
      line: "Ивашко Васильев сын Анфилогов",
      href: "/records/RGADA-210-12-13-L149",
      leaf: "л. 149",
    },
    changed: true,
  },
  {
    person: "Алексей Васильевич",
    july: {
      date: "2 июля",
      form: "Онфилогов",
      line: "Олешка Васильев сын Онфилогов",
      href: "/records/RGADA-210-12-13-L105",
      leaf: "л. 105",
    },
    october: {
      date: "4 октября",
      form: "Онфилогов",
      line: "Олешка Васильев сын Онфилогов",
      href: "/records/RGADA-210-12-13-L149",
      leaf: "л. 149",
    },
    changed: false,
  },
  {
    person: "Марк Карпович",
    july: {
      date: "2 июля",
      form: "Онфилогов",
      line: "Марка Карпов сын Онфилогов",
      href: "/records/RGADA-210-12-13-L106",
      leaf: "л. 106",
    },
    october: {
      date: "4 октября",
      form: "Анфилогов",
      line: "Марко Карпов сын Анфилогов",
      href: "/records/RGADA-210-12-13-L151",
      leaf: "л. 151",
    },
    changed: true,
  },
];

export function OrelSurnameShiftEvidence() {
  return (
    <figure className="orel-surname-shift">
      <figcaption>
        <span>Одно дело · одна служебная смена</span>
        <strong>Как фамилия изменилась между двумя смотрами</strong>
      </figcaption>

      <div className="orel-surname-shift-head" aria-hidden="true">
        <span>Служилый человек</span>
        <span>2 июля 1626</span>
        <span>4 октября 1626</span>
      </div>

      <ol>
        {comparisons.map((entry) => (
          <li className={entry.changed ? "is-changed" : "is-stable"} key={entry.person}>
            <div className="orel-surname-shift-person">
              <strong>{entry.person}</strong>
              <span>{entry.changed ? "Он- → Ан-" : "форма не изменилась"}</span>
            </div>

            {[entry.july, entry.october].map((record) => (
              <a href={record.href} key={`${entry.person}-${record.date}`}>
                <span className="orel-surname-shift-mobile-date">{record.date}</span>
                <strong>{record.form}</strong>
                <q>{record.line}</q>
                <small>{record.leaf} · открыть карточку →</small>
              </a>
            ))}
          </li>
        ))}
      </ol>

      <footer>
        <p>
          Сопоставлены повторные записи тех же людей в опубликованной построчной
          транскрипции дела. Иван и Алексей стоят рядом и в июле, и в октябре;
          поэтому различие их октябрьских форм нельзя объяснить общей заменой во всём списке.
        </p>
        <p className="orel-surname-shift-caveat">
          Фотокопии лл. 105, 106, 149 и 151 пока не получены. До сверки с рукописью
          это доказательство по научно проверяемой публикации текста, а не по цифровому образу листа.
        </p>
        <a
          className="orel-surname-shift-source"
          href="https://forum.vgd.ru/6766/189781/"
          target="_blank"
          rel="noreferrer"
        >
          Полная публикация смотренного списка на VGD ↗
        </a>
      </footer>
    </figure>
  );
}

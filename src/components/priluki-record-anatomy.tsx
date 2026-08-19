const recordGroups = [
  { title: "Церкви села" },
  { title: "Двор монастырского старца" },
  { title: "Пашенные крестьянские дворы" },
];

export function PrilukiRecordAnatomy() {
  return (
    <figure className="priluki-record-anatomy">
      <header>
        <span>Писцовая книга · 1536/37</span>
        <strong>Как в выписи устроено село</strong>
      </header>

      <ol aria-label="Порядок описания села Прилуки в выписи">
        {recordGroups.map((group, index) => (
          <li key={group.title}>
            <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
            <b>{group.title}</b>
          </li>
        ))}
        <li className="is-expanded">
          <i aria-hidden="true">04</i>
          <div>
            <b>Непашенные дворы</b>
            <p>в. Некраско Данилов</p>
            <p className="is-focus">в. Тонкой Онфилогов</p>
          </div>
        </li>
      </ol>

      <figcaption>
        Единственное, что выпись сообщает о Тонком, — где именно стоит его строка.
      </figcaption>
    </figure>
  );
}

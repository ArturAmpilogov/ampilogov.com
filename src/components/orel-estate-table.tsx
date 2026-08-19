const holdings = [
  {
    owner: "Беляй Васильевич Онфилогов",
    place: "Баздырево",
    ploughed: "9",
    wild: "51",
    hay: "115",
  },
  {
    owner: "Осип Васильевич Анфилогов",
    place: "Баздырево",
    ploughed: "5",
    wild: "19",
    hay: "70",
  },
  {
    owner: "Василий, Тимофей и Карп Микулины",
    place: "Баздырево · сообща",
    ploughed: "6",
    wild: "51",
    hay: "115",
  },
  {
    owner: "Иван Першин Анфилогов",
    place: "Белая",
    ploughed: "4",
    wild: "29",
    hay: "50",
  },
  {
    owner: "Софон Тимофеев Анфилогов",
    place: "Софоново",
    ploughed: "4",
    wild: "36",
    hay: "85",
  },
  {
    owner: "Ермак Пахомов Анпилогов",
    place: "Малцовская",
    ploughed: "7",
    wild: "19",
    hay: "40",
  },
  {
    owner: "Иван Нечаев Анпилогов",
    place: "займище на Радомле",
    ploughed: "0",
    wild: "15",
    hay: "80",
  },
] as const;

export function OrelEstateTable() {
  return (
    <figure className="orel-estate-table">
      <figcaption>
        <span>Семь владений · 1594/95 год</span>
        <strong>35 четвертей пашни против 220 четвертей ещё не поднятой земли</strong>
      </figcaption>
      <div className="orel-estate-table-scroll" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th scope="col">Владелец</th>
              <th scope="col">Место</th>
              <th scope="col">Пашня, четвертей</th>
              <th scope="col">Дикое поле, четвертей</th>
              <th scope="col">Сено, копен</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr key={`${holding.owner}-${holding.place}`}>
                <th scope="row">{holding.owner}</th>
                <td>{holding.place}</td>
                <td>{holding.ploughed}</td>
                <td>{holding.wild}</td>
                <td>{holding.hay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>Пашня и дикое поле указаны «в одном поле» трёхпольного цикла.</p>
    </figure>
  );
}

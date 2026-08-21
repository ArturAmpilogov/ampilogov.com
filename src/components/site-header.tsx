import Link from "next/link";

export function SiteHeader({ tone = "paper" }: { tone?: "paper" | "ink" }) {
  return (
    <header className={`site-header site-header--${tone}`}>
      <Link className="wordmark" href="/" aria-label="Ампилоговы — на главную">
        АМПИЛОГОВЫ
      </Link>
      <nav className="site-nav" aria-label="Основная навигация">
        <Link href="/#chapters">История</Link>
        <Link href="/records">Записи</Link>
        <Link href="/people">Люди</Link>
        <Link href="/map">Карта</Link>
        <Link href="/read/research/sources">Источники</Link>
      </nav>
    </header>
  );
}

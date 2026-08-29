#!/usr/bin/env python3
"""Rank pre-1594 Dom Predkov source groups for the Oryol Anfilogov search.

The public XLSX export exposes case, year, city and a short ``surname, name``
label.  This script deliberately treats matches as search signals only: it
does not infer kinship or migration from spelling/name overlap.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
from collections import Counter, defaultdict
from pathlib import Path


YEAR_RE = re.compile(r"(?<!\d)(1[45]\d{2})(?!\d)")

# Rare names among the seven fathers are useful search signals. Common names
# are retained with a deliberately low weight so they cannot dominate cities
# with large published rosters.
NAME_SIGNALS = {
    "Микула": (re.compile(r"\bмикул(?:а|ка|ко|кои)?\b", re.I), 3.0),
    "Перша": (re.compile(r"\bперш(?:а|ка|ко)?\b", re.I), 3.0),
    "Нечай": (re.compile(r"\bнеча(?:й|я|ю|ем)\b", re.I), 3.0),
    "Пахом": (re.compile(r"\bпахом(?:а|ка|ко|ий)?\b", re.I), 2.5),
    "Терентий": (re.compile(r"\bтерент(?:ий|ей|ьей|ья|ию|ею)\b", re.I), 2.0),
    "Карп": (re.compile(r"\bкарп(?:а|ка|ко)?\b", re.I), 0.75),
    "Тимофей": (re.compile(r"\bтимоф(?:ей|ея|ею|еем|ейко)\b", re.I), 0.5),
    "Василий": (re.compile(r"\bвасил(?:ий|ей|ья|ию|ею|ько|ко)\b", re.I), 0.4),
}

SURNAME_SIGNALS = {
    "Анфилоговский ряд": (
        re.compile(r"^(?:анпи|ампи|анфи|онпи|онфи|амфи|онфило|анфило|ампило)", re.I),
        6.0,
    ),
    "Баздыревы": (re.compile(r"^(?:баздыр|боздыр)", re.I), 2.0),
    "Труновы": (re.compile(r"^трун", re.I), 2.0),
    "Немцовы": (re.compile(r"^немц", re.I), 2.0),
    "Криволаповы": (re.compile(r"^криволап", re.I), 2.0),
    "Лунины": (re.compile(r"^лунин", re.I), 1.0),
    "Тахтамышевы": (re.compile(r"^(?:тахтамыш|тохтамыш)", re.I), 1.5),
    "Костины": (re.compile(r"^костин", re.I), 0.75),
    "Гревцовы": (re.compile(r"^гревц", re.I), 1.5),
}


def strict_pre_1594(value: str) -> bool:
    """Accept only date labels whose every explicit year is no later than 1593."""
    years = [int(year) for year in YEAR_RE.findall(value or "")]
    return bool(years) and max(years) <= 1593


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_path", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    city_totals: Counter[str] = Counter()
    city_cases: dict[str, set[str]] = defaultdict(set)
    source_groups: Counter[tuple[str, str, str]] = Counter()
    city_signals: dict[str, Counter[str]] = defaultdict(Counter)
    city_signal_cases: dict[str, dict[str, set[str]]] = defaultdict(
        lambda: defaultdict(set)
    )
    matches: list[dict[str, object]] = []
    strict_rows = 0

    with args.csv_path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle)
        header = next(reader)
        for row in reader:
            if len(row) < 4:
                continue
            case, year, city, person = (cell.strip() for cell in row[:4])
            if not strict_pre_1594(year):
                continue
            strict_rows += 1
            city = city or "[город не указан]"
            city_totals[city] += 1
            source_groups[(case, year, city)] += 1
            if case:
                city_cases[city].add(case)

            signals: list[str] = []
            for label, (pattern, _weight) in NAME_SIGNALS.items():
                if pattern.search(person):
                    signals.append(label)
            surname = person.split(maxsplit=1)[0] if person else ""
            for label, (pattern, _weight) in SURNAME_SIGNALS.items():
                if pattern.search(surname):
                    signals.append(label)

            if signals:
                matches.append(
                    {
                        "case": case,
                        "year": year,
                        "city": city,
                        "person": person,
                        "signals": signals,
                    }
                )
                for signal in signals:
                    city_signals[city][signal] += 1
                    if case:
                        city_signal_cases[city][signal].add(case)

    weights = {
        **{label: weight for label, (_pattern, weight) in NAME_SIGNALS.items()},
        **{label: weight for label, (_pattern, weight) in SURNAME_SIGNALS.items()},
    }
    cities = []
    for city, counts in city_signals.items():
        rare_fathers = sum(1 for name in ("Микула", "Перша", "Нечай", "Пахом", "Терентий") if counts[name])
        neighbors = sum(1 for name in SURNAME_SIGNALS if name != "Анфилоговский ряд" and counts[name])
        raw_score = sum(weights[label] * math.log1p(count) for label, count in counts.items())
        # Damp the advantage of very large represented cities while preserving
        # genuinely diverse clusters of independent signals.
        adjusted_score = raw_score / max(1.0, math.log10(city_totals[city] + 10))
        cities.append(
            {
                "city": city,
                "rows": city_totals[city],
                "cases": sorted(city_cases[city]),
                "signalCounts": dict(counts.most_common()),
                "signalCaseCounts": {
                    key: len(value) for key, value in city_signal_cases[city].items()
                },
                "rareFatherSignals": rare_fathers,
                "neighborSurnameSignals": neighbors,
                "rawScore": round(raw_score, 4),
                "adjustedScore": round(adjusted_score, 4),
            }
        )
    cities.sort(
        key=lambda item: (
            item["rareFatherSignals"] + item["neighborSurnameSignals"],
            item["adjustedScore"],
        ),
        reverse=True,
    )

    result = {
        "source": str(args.csv_path),
        "columns": header[:4],
        "dateRule": "included only rows whose every explicit year is <= 1593",
        "strictPre1594Rows": strict_rows,
        "sourceGroups": [
            {"case": case, "year": year, "city": city, "rows": count}
            for (case, year, city), count in source_groups.most_common()
        ],
        "matchedRows": len(matches),
        "methodWarning": (
            "Signals rank source groups for scan review only; they do not prove "
            "kinship, identity, or migration to Oryol."
        ),
        "cities": cities,
        "matches": matches,
    }
    encoded = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        args.output.write_text(encoded + "\n", encoding="utf-8")
    else:
        print(encoded)


if __name__ == "__main__":
    main()

# The "Dom Predkov" Index of Servicemen

A. Shatokhin's index brings together the names of 16th–18th-century servicemen from RGADA files
in a single database: 421,095 entries as of August 2026. A search for all documentary
forms of the surname produced **187 machine lines** with the root -пилог-/-филог- (-pilog-/-filog-) and another 10
lines of the short form «Анпилов» (Anpilov). Checking against the full name index of one of the
files ruled out two false matches; **185 lines** remained in the working sample.
The raw export and the results of the check are saved in
[`data/genealogy/indexes/dompredkov-anpilogov.json`](../../data/genealogy/indexes/dompredkov-anpilogov.json).

## Where to Get the Data

The project has two interfaces. They **did not match in the first pass**, but the public
spreadsheet had been updated by 26 August 2026.

[The search website](https://next-fast-table-gold.vercel.app/) remains a convenient
interface for current searching.
[The Google spreadsheet](https://docs.google.com/spreadsheets/d/1ZSoqya5thvsa2j_4Z-6RSqkCSLejHvy93V0MyxTK4Xk/edit)
lagged behind in the first pass: it lacked 19 machine lines of the form «Онпилогов» (Onpilogov)
and the years of seven files. The XLSX downloaded on 26 August already contains **421,677 rows including the
header**, both tabs «База» (Database) and «Описание документов» (Description of Documents), and all 19 lines of
«Онпилогов». So the earlier 168 lines describe the old snapshot, not the
current spreadsheet. Neither the website nor the spreadsheet replaces the primary source, however:
every line must be checked against a full publication or an image.

### What Could Be Extracted from the Full Excel Copy

Not only the visible cells were checked, but also the structure of the file, the sheets, the notes and
the additional columns. Row **7452** contains exactly four values:
**«сборн» ("composite") — «1605–1618» — «Курск» (Kursk) — «Анпилогов Федор» (Anpilogov Fyodor)**. All the other
public cells of the row are empty; it has no hidden sheet, comment, photo link or
archival call number. The «Описание документов» tab explains the code
only as «служилые люди Смуты 1605–1618 гг.» ("servicemen of the Time of Troubles, 1605–1618").

This changes the meaning of the find. **1605–1618 is not the date of a single event concerning Fyodor** but the
range of a mixed compilation. The public description of the compilation states plainly that
it includes prisoners, landholders of captured peasants, recipients of cash and
land supplements (pridachi), and other records. Consequently it is not yet known whether
Fyodor was a Kursk serviceman, the owner of someone else's captured peasant,
a prisoner himself, or a party to some other matter. Under the scope rule, a profile `P9737` and an index
Record `PUB-DOMPREDKOV-SMUTA-1605-1618-FEDOR-ANPILOGOV` have been created for the bearer of the researched surname,
but they are explicitly marked as a search lead without a primary folio. No map point or route is created.

A count by the start of the whole full-name field in the current XLSX gave: Анпилогов (Anpilogov) — 163,
Онпилогов (Onpilogov) — 19, Анфилогов (Anfilogov) — 3, Онфилогов (Onfilogov) — 1, Анпилов (Anpilov) — 10, Анфилов (Anfilov) — 3.
Short queries in the web application give other numbers because they also search for a personal
name after a space: that is exactly why «Анфи» (Anfi) and «Онфи» (Onfi) bring up people of other
surnames.

The filter on the website matches **the start of a word**, not any substring: the query
«нпилог» (npilog) gives zero, «Анпилог» (Anpilog) — 164. So each form must be queried
separately and from the start of the word. 25 spellings were checked.

| Query | Lines |
| --- | --- |
| Анпилог | 164 |
| Онпилог | 19 |
| Анфилог | 4 (one of them already in «Анпилог») |
| Онфилог | 1 |
| Анпилов | 10 |
| Ампилог, Ампилов, Амфилог, Онфилов, Емпилог, Емпалог, Емпил, Анпилаг, Онпилаг, Анпалог, Онпалог, Ампалог, Анфилаг, Омпил, Анпел, Анпол, Ямпил, Апилог, Ампал, Еппал | 0 |

The forms **Ampilogov and Empilogov do not appear in the index at all**. In the files of the Razryad
Prikaz (Military Service Chancellery) the southern branch is written only with «Анпилог-», «Онпилог-», «Анфилог-» and
«Онфилог-» (Anpilog-, Onpilog-, Anfilog-, Onfilog-); the form «Ампилогов» (Ampilogov) appears later.

### Check with Short Queries, 26 August 2026

The suggested short beginnings were checked in addition: **Анпи — 174, Ампи — 1,
Анфи — 187, Онпи — 19, Онфи — 11** lines. They are useful as a net for spellings not known
in advance, but they cannot be added up as surname matches.
The interface searches the whole full-name field: the query «Анфи» brings up many people of
other surnames with the personal names Anfim, Anfinogen and Anfilofey; «Онфи» —
Onfimovs and Onfinogenovs. The single «Ампи» line is Ivan Ampirev from Dankov,
who does not belong to the surname series.

After removing duplicates, 184 name–year–town–file combinations of the target and
control short forms were identified, spread over 36 archival units or composite
publications. There is no new 16th-century mention: the earliest hit is still
Fyodor Anpilogov, Kursk, with the broad range 1605–1618 and no exact call number or
folio. So the short search confirms the completeness of the current register but does not
solve the question of origins before Oryol.

A check of the full Kursk text showed how dangerous it is to take a short
match for a person of the surname series. On fol. 9v of the review desyatnya (razbornaya desyatnya, service register) of 1626
the four-year-old son of Makar Timofeyev Brezhnev is named. A modern publication
reads his name as **«Олфиногенко»** (Olfinogenko), an earlier independent extract as
**«Онфиногенко»** (Onfinogenko). This is a diminutive of the name Anfinogen / Onfinogen, not
Anfilof or Anfilog. The exact location is **RGADA, f. 210, op. 4, d. 300, fol. 9v**;
the official inventory confirms file 300, whereas old forum posts
wrongly give file 330. No profile, Record or map entry is created; the discrepancy is
kept in `LEAD-210-4-300-KURSK-ONFINOGENKO-FALSE-POSITIVE` until the scan is checked.

Three short forms not previously entered as cards have been set aside separately:
**Boris Anfilov** (Kozlov, 1687, f. 210, op. 6е, d. 33), **Rodion Anfilov**
(Kozlov, 1700, f. 210, op. 13, d. 2516) and **Sila Anfilov** (Kozlov, 1703,
f. 210, op. 6е, d. 43). Until the folios are viewed, this is one possible local series
or three index matches, not proven relatives of Anfilogovs.

## What This Source Is and What It Is Not

An index line contains only the file call number, the year, the town and the name. It has no folio,
no patronymic and no transcription, and the reading of the surname was made by the compiler and
has not been checked against the image. For the target surname series a line may receive
a separate Record as an **index-only lead**, but this does not turn it into a
transcribed primary document. The card must show the absence of a folio,
an exact year and a literal reading; such a lead does not go on the map.

### Attempt to Identify the "сборн" Source, 27 August 2026

The open database «Служивые» (Servicemen), attached in 2017 to a post on the VGD forum, was checked.
It is a separate Access index with fields for fond, inventory, file and folio. A search
for all variants of Анпилогов/Онпилогов (Anpilogov/Onpilogov), and separately for the combination Fyodor + Kursk, did not
find the target entry of 1605–1618. So the old open database cannot be
used to recover the hidden call number of the new line and must not be mixed
with the "Dom Predkov" index.

The typed-up inventories of fond 210 were also checked. The unit closest in date and
content is **RGADA, f. 210, op. 24, d. 5**: 1616–1617, 138 folios,
petitions of deti boyarskie about pay, correspondence with town voivodes,
cash disbursements and provisions for captive regiments. It fits several
categories of the compilation described by the compiler at once, but the word «Курск» (Kursk) and the name of Fyodor
are absent from the title. So it is only a candidate for a name-by-name review, not
an established call number for the entry.

[The open attachment of the «Служивые» (Servicemen) database](https://forum.vgd.ru/post/5/64941/p1878181.htm),
[RGADA, f. 210, op. 24](https://inv.velikie.org/archive/rgada/210/24/).

The year more often refers to the whole file than to a specific entry. In the register the
index year (`year.asIndexed`) and the dating of the file (`year.delaRange`) are stored
separately.

The patronymic, the oklad (service entitlement), service activity, family composition and a photocopy of the folio are not shown
in the open part of the website — the author supplies them on request for a fee.
The results table has the same four fields as the export.

## What the Website Added

**Nineteen machine lines of the form «Онпилогов» (Onpilogov)** missing from the spreadsheet.
After checking, one was excluded; among the rest:

- **210-14-502, 1620/21, Oryol.** The full published index corrects
  the machine selection: the file names **Василей Дмитреев Анпилогов** (Vasiley, son of Dmitry, Anpilogov; fol. 67),
  **Олексей Васильев Анфилохов** (Oleksey, son of Vasily, Anfilokhov; fol. 94) and **Иван Васильев Анфилохов** (Ivan, son of Vasily, Anfilokhov; fol. 109).
  The names «Марк» (Mark) and «Илюшка» (Ilyushka) are not in the full index.
- **210-9-1096, a list not earlier than 1632, Kursk — Onpilogovs Vaska, Senka (twice) and Fedka.** The web index says "about 1631", but the archival inventory dates the relevant scroll section (stolpik) only as "not earlier than 7141/1632". A full open transcription has now revealed all four: Fyodor Grigoryevich (fol. 157, 200 chetverti), Semyon Osipovich (fol. 189, 100), Semyon Yakovlevich (fol. 190, 100) and Vasily Semyonovich (fol. 204, a novik of the year 136, 100). A Record `PUB-KURKULEV-KURSK-1632-ONPILOGOVY` has been created.
- **210-12-13, 1626, Oryol — Onpilogov Vaska, Ivashka (twice), Mark (twice).**
  These are exactly the people already entered as P0034, P0035, P0037: the index
  independently confirms the composition of the `RGADA-210-12-13-*` records.
- **210-12-257, 1647/48, Oryol and Mtsensk** — five Onpilogovs in addition to five
  Anpilogovs in the same file.
- **210-6в-10, 1653–1662, Belgorod — Onpilogov Zinov.** Geography new to the
  project.

In addition, the website supplied years where the spreadsheet had left them blank: 210-14-502 —
1620/21, 210-12-381 — 1655–1658, 210-6е-20 — 1670–1672, 210-6д-161 — 1691–1693,
1157-1-7 and 1157-1-9 — 1686/87, the composite document — 1605–1618.

## Geography and Chronology

Oryol — 123 lines, Kromy — 29, Kursk — 14, Livny and Bolkhov — 5 each, then
single mentions in Nedrygailov, Novy Oskol, Mtsensk, Belgorod, Aleshnya,
Oboyan, Khotmyzhsk and Volny. The chronology runs from 1620/21 to 1707.

Three lines of file 210-12-13 are marked `covered-by-record`. The remaining entries
are kept as leads to check; false and superseded short readings have
separate statuses and are not counted among confirmed mentions.

## Separately: the Form «Анпилов» (Anpilov)

Ten lines have been put in the class `ambiguous-short-form`. In the project dictionary
«Анпилов» (Anpilov) is marked `documentary-variant-or-separate-surname`: it may be an
abbreviation of the same surname, or it may be a separate surname. They are not included in the counts
of the main sample.

The initial machine export attributed four
forms of the surname to file **210-4-260 (Oryol, 1642)**. A line-by-line publication refined the result: seven
lines are confirmed in the file — one `Анпилов` (Anpilov) and six `Анфилогов` (Anfilogov). The old export mixed into
this file names and spellings from other lists. A final reading of each
line still requires an image of the manuscript.

## Search Priority

| File | Year | Town | Lines | Title |
| --- | --- | --- | --- | --- |
| f. 210, op. 14, d. 502 | 1620/21 | Oryol | 3 | Review list of the men of Oryol |
| f. 210, op. 6д, d. 1 | 1628 | Oryol | 1 | Noviki of Oryol |
| f. 210, op. 4, d. 270 | 1628 | Kursk | 1 | Enrolment desyatnya of various towns |
| f. 210, op. 12, d. 27 | 1629 | Oryol | 4 | Dvoryane and deti boyarskie of various towns |
| f. 210, op. 9, d. 1096, stolpik 4 | not earlier than 1632 | Kursk | 4 | Undated list of the deti boyarskie of Novosil, Chern and Kursk |
| f. 210, op. 14, d. 114 | 1640 | Oryol | 8 | Dvoryane and deti boyarskie of Oryol |
| f. 210, op. 4, d. 260 | 1642 | Oryol | 7 | Servicemen of Oryol |

## Result of the Search for Openly Available Scans

For the file **RGADA, f. 210, op. 14, d. 502** an open collection of
photocopies was found. The full set of 409 frames was checked. Full images of fols. 67,
94, 94v and 109, as well as exact crops of the three surname entries, are saved in
[`public/archive/evidence/rgada/f210-op14-d502`](../evidence/rgada/f210-op14-d502/README.md).
From the full name index and the sequence of neighbouring blocks it has been established that
the beginning of Vasily Dmitriyevich's entry is at the bottom of fol. 67, Aleksey
Vasilyevich's entry is on fol. 94v, and Ivan Vasilyevich's entry is the first complete block
on fol. 109. The full handwritten text of the service formulas has not yet been read, so
for now these are source cards, not `Records`.

For the other files in the table, no digital copies were found in the open collections
checked.

First, a partial publication of two supplementary lists of noviki on
[fols. 313–326v](http://old-kursk.ru/book/kurkulev_a/ku260330.html) was found, where
the surname did not appear. Then a separate full transcription of the main
[Kursk section, fols. 176–186](https://old-kursk.ru/book/kurkulev_a/ku260320.html) was discovered.
On **fol. 185** stands Vasily Semyonov syn Anpilogov (Vasily, son of Semyon, Anpilogov): his father has died, he has no brothers,
he holds 40 chetverti of his father's pomestye; the new oklad is 100 chetverti and 4 roubles.
The official card of the GIS UIAD (the state archival information system) gives a digital address for the whole file:
[RGADA, f. 210, op. 4, d. 270](https://online.archives.ru/guide/10000000001014/10000000157014/10000000344014/10000474444014/).
What is needed now is not a trawl through the book but a photocopy of the single fol. 185 and a land search
for the father's 40 chetverti.

## Publications Not in the Index

Two pages by the same author contain Kursk Onpilogovs absent from the
"Dom Predkov" database and can be read free of charge:

- [List of the dvoryane and deti boyarskie of Kursk, 1630](http://old-kursk.ru/book/kurkulev_a/ku260428.html)
  — RGADA, f. 210, op. 12, d. 7, fols. 84–146;
- [Muster roll from the estimate book of Kursk, 1640](http://old-kursk.ru/book/kurkulev_a/sm260226.html).

The 1640 publication has now been read directly. On fol. 28v stands **Semyon
Yakovlev syn Onpilogov** (Semyon, son of Yakov, Onpilogov), on foot with a pishchal (matchlock) and an oklad of 100 chetverti; on
fol. 43v — **Sergey Grigoryev syn Onpilogov** (Sergey, son of Grigory, Onpilogov), on foot with a boar-spear (rogatina), a novik
of the 1636 enrolment with an oklad of 150 chetverti; on fol. 67 — a new **Ivan Semyonov
syn Onpilogov** (Ivan, son of Semyon, Onpilogov), a novik of the voivode Ivan Buturlin with an oklad of 100 chetverti,
who reported on a gelding with a pishchal. The exact call number of the book: **RGADA, f. 210, op. 4,
d. 180**. Images of all three lines have been saved; a Record
`PUB-KURKULEV-KURSK-1640-ONPILOGOVY` and Ivan's profile `P9685` have been created.

The 1630 publication has also received separate lead cards with exact
folios, but until handwritten images are obtained they keep that status.

The earlier indirect confirmation has now been replaced by an exact publication of the same
file. On fols. 157, 189, 190 and 204, Fyodor Grigoryevich, Semyon
Osipovich, Semyon Yakovlevich and Vasily Semyonovich Onpilogov are named literally. The date 1632
remains the publisher's reasoned dating: the beginning of the manuscript is lost,
and the official inventory gives only the limit "not earlier than 1632".

In the second publication two lines matter. «Сергей Григорьев сын Онпилогов» (Sergey, son of Grigory, Onpilogov) would be
the missing link between the Kursk record of 1636 and the Oboyan record of 1651 — both
already linked to [P0052](../../data/genealogy/people/P0052-sergey-grigorievich-anpilogov.json).
«Семен Яковлев сын Онпилогов» (Semyon, son of Yakov, Onpilogov) matches in name and patronymic
[P0065](../../data/genealogy/people/P0065-semyon-yakovlevich-onpilogov.json),
named in the Kursk regimental list of 1655: the same town, fifteen
years apart.

The third find refines an existing record: the review desyatnya of Kursk of
1636 has the call number **f. 210, op. 4, d. 215**
([otkudarodom.ua](https://otkudarodom.ua/ru/1636-god-desyatnya-razbornaya-sluzhilyh-lyudey-goroda-kurska)),
The card `PUB-KURSK-1636-SERGEY` has now been refined from the full transcription: RGADA, f. 210, op. 4, d. 215, fol. 103v.

In passing, a small gap in the dictionary came to light: `surname-variants.json` lacks the form
**Онпилогов** (Onpilogov), although it occurs in the documents and in the display names of P0034, P0064,
P0065 and P0066. The index gave another 19 machine matches of this form; 18 of them
remained valid after checking the full index to the file of 1620/21.

## Next Steps

1. Compare the rare names of the whole Kursk «сборн» ("composite") block not with neighbouring rows of the
   XLSX but with the name indexes of individual files on captivity and cash supplements.
2. Check RGADA, f. 210, op. 24, d. 5 name by name; a match of several rare
   Kursk names must come before declaring the file the source for Fyodor.
3. On the photocopies of file op. 14, d. 502 already saved, complete the literal
   transcription of the three service formulas.
4. Obtain a photocopy of RGADA, f. 210, op. 4, d. 270, fol. 185 with the full entry for
   Vasily Semyonovich and search for the father's pomestye named there.

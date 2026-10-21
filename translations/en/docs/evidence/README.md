# Photocopies of Sources

This is where the photocopies on which the `records/` cards are based are stored.

## Structure

```text
evidence/
  rgada/
    f181-op2-d120/
      0060.jpg
  publications/
    ruslang/
      etymology-1971/
        13-nikonov.pdf
        pages/
          0263.jpg
  dazo/
  gark/
  gia-ko/
```

## Rules

1. The original downloaded file is kept without cropping or enhancement.
2. The directory name contains the archive, fond, opis and delo.
3. The file name keeps the frame or folio number.
4. The frame must include the page context; enlarged fragments may be placed next to it with the suffix `-crop`, but they do not replace the original.
5. For every photocopy of a primary document there is at least one `R####` card.
6. Scholarly publications may be attached directly to the entry in the source registry; for a key page, a separate image is kept alongside.
7. The card or the source registry gives the URL it was obtained from, the archival reference or bibliographic description, the page and the download date.
8. An index or a website card without an image does not count as a photocopy.

## Remote Viewers: the Required Set

For Yandex Archive and other viewers that do not serve the source file directly,
each frame used is saved as three separate images:

1. `####-full-view.png` — the whole folio or spread. The image contains only the
   document: no site header, OCR panel, buttons, search results, browser bars or other
   interface elements.
2. `####-header.png` — an enlarged area with the book's heading, year, part and column
   names. The heading must be legible without resorting to the site's OCR.
3. `####-target-entry.png` or `####-target-entry-document-*.png` — an enlarged view of the exact
   line with the surname being researched, the names, date, kinship and status. Enough
   neighbouring lines and columns are kept to establish unambiguously that the text belongs to the right entry.

A screenshot of a site page, a search card or a viewer window does not replace any of
these files. OCR is acceptable only as a search hint and must not appear in the photocopy.
The set counts as verified only after all three images have been visually inspected and
their SHA-256 recorded in the corresponding Record.

## Formats

- JPEG or PNG for individual frames;
- PDF is acceptable for a whole file or publication;
- TIFF is kept if it is the archive's original format;
- derived WebP files for the site are created later and do not replace the originals.

Large files are connected through Git LFS if necessary, but single parish register frames and pages are stored directly in Git.

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

// src/proxy.ts answers 404 under /archive/* unless the visitor carries the
// backup cookie. A page may link to a private full sheet there, but an image
// loaded from it is broken for every reader.
const root = path.resolve(import.meta.dirname, "../..");
const linkTags = new Set(["a", "Link"]);

const sourceFiles = (directory, extension) => readdirSync(path.join(root, directory), { recursive: true })
  .filter((file) => file.endsWith(extension))
  .map((file) => path.join(directory, file));

function privateImageLoads(code) {
  const problems = [];
  for (const match of code.matchAll(/(["'`])(\/archive\/[^"'`]*)\1/g)) {
    const before = code.slice(0, match.index);
    const [, name, assignment] = before.match(/([\w$]+)\s*(=\s*\{?|:)\s*$/) ?? [];
    if (assignment?.startsWith("=")) {
      const tag = before.match(/<([A-Za-z][\w.]*)[^<>]*$/)?.[1];
      if (name === "href" && linkTags.has(tag)) continue;
    } else if (assignment === ":") {
      // A data field such as `full: "/archive/..."` is fine only when every use
      // of it is the href of a link.
      const uses = code.match(new RegExp(`\\.${name}\\b`, "g"))?.length ?? 0;
      const linkUses = code.match(new RegExp(`<(?:a|Link)\\b[^<>]*?\\shref=\\{[\\w$.?]*\\.${name}\\}`, "g"))?.length ?? 0;
      if (uses > 0 && uses === linkUses) continue;
    }
    problems.push(match[2]);
  }
  return problems;
}

function privateMarkdownImages(markdown) {
  return [...markdown.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)/g)]
    .map((match) => match[1])
    // resolveDocumentUrl in src/lib/docs.ts serves every relative path from /archive/.
    .filter((url) => url.startsWith("/archive/") || !/^(https?:|mailto:|#|\/)/.test(url));
}

test("the checks allow links to private sheets and catch images loaded from them", () => {
  assert.deepEqual(privateImageLoads(`<a className="sheet" href="/archive/a.jpg">`), []);
  assert.deepEqual(privateImageLoads(`const rows = [{ full: "/archive/a.jpg" }];\n<a href={row.full} key="k">`), []);
  assert.deepEqual(privateImageLoads(`<img alt="" src="/archive/a.jpg" />`), ["/archive/a.jpg"]);
  assert.deepEqual(privateImageLoads(`<image href={"/archive/a.jpg"} />`), ["/archive/a.jpg"]);
  assert.deepEqual(privateImageLoads(`const rows = [{ image: "/archive/a.jpg" }];\n<img src={row.image} />`), ["/archive/a.jpg"]);
  assert.deepEqual(
    privateImageLoads(`const rows = [{ full: "/archive/a.jpg" }];\n<a href={row.full}><img src={row.full} /></a>`),
    ["/archive/a.jpg"],
  );
  assert.deepEqual(
    privateMarkdownImages("[лист](/archive/a.jpg) ![скан](/archive/b.jpg) ![копия](scans/c.jpg) ![обложка](/evidence/d.jpg)"),
    ["/archive/b.jpg", "scans/c.jpg"],
  );
});

test("components never load an image from /archive/", () => {
  const problems = ["src/components", "src/app"]
    .flatMap((directory) => sourceFiles(directory, ".tsx"))
    .flatMap((file) => privateImageLoads(readFileSync(path.join(root, file), "utf8")).map((url) => `${file}: ${url}`));
  assert.deepEqual(problems, []);
});

test("docs never show an image from /archive/", () => {
  const problems = sourceFiles("docs", ".md")
    .flatMap((file) => privateMarkdownImages(readFileSync(path.join(root, file), "utf8")).map((url) => `${file}: ${url}`));
  assert.deepEqual(problems, []);
});

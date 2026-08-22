// ВРЕМЕННЫЙ маршрут. Заведён 22.08.2026 только для того, чтобы скачать сканы
// рукописных алфавитов РГАДА в обход блокировки загрузок в Chrome.
// Удалить сразу после того, как том будет пройден.
import { NextRequest } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tome = params.get("tome");
  const scans = (params.get("scans") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const gap = Number(params.get("gap") ?? 1500);

  if (!tome || !/^\d{1,4}$/.test(tome) || scans.length === 0) {
    return new Response("usage: ?tome=128&scans=4,13,14&gap=1500\n", { status: 400 });
  }

  const outDir = path.join(process.cwd(), "tmp", "rgada", `ukaz${tome}`);
  await mkdir(outDir, { recursive: true });

  const lines: string[] = [];
  for (const raw of scans) {
    if (!/^\d{1,4}$/.test(raw)) {
      lines.push(`${raw} SKIP not-a-number`);
      continue;
    }
    const padded = raw.padStart(4, "0");
    const url = `http://rgada.info/opisi/210-ukaz_${tome}/${padded}.jpg`;
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        lines.push(`${padded} HTTP ${response.status}`);
        continue;
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      await writeFile(path.join(outDir, `${padded}.jpg`), bytes);
      lines.push(`${padded} OK ${bytes.length}`);
    } catch (error) {
      lines.push(`${padded} ERR ${(error as Error).message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, gap));
  }

  return new Response(lines.join("\n") + "\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

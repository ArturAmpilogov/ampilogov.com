#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const values = new Map();
for (let index = 2; index < process.argv.length; index += 2) values.set(process.argv[index], process.argv[index + 1]);
const targetPath = values.get("--target");
const updatePath = values.get("--update");
if (!targetPath || !updatePath) throw new Error("Нужны --target и --update");

const target = JSON.parse(await readFile(targetPath, "utf8"));
const update = JSON.parse(await readFile(updatePath, "utf8"));
const readings = new Map(target.readings.map((reading) => [`${reading.catalogId}/${reading.scanNumber}`, reading]));
for (const reading of update.readings) readings.set(`${reading.catalogId}/${reading.scanNumber}`, reading);
target.readings = [...readings.values()];
await writeFile(targetPath, `${JSON.stringify(target, null, 2)}\n`);
console.log(JSON.stringify({ merged: update.readings.length, total: target.readings.length }));
